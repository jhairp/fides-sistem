param(
    [Parameter(Mandatory = $true)]
    [string]$AccessDb,

    [string]$OutputDir = "backend/legacy_exports"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $AccessDb)) {
    throw "Access database not found: $AccessDb"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$resolvedDb = (Resolve-Path -LiteralPath $AccessDb).Path
$resolvedOut = (Resolve-Path -LiteralPath $OutputDir).Path
$providers = @("Microsoft.ACE.OLEDB.16.0", "Microsoft.ACE.OLEDB.12.0")
$connection = $null
$providerUsed = $null

foreach ($provider in $providers) {
    try {
        $connectionString = "Provider=$provider;Data Source=$resolvedDb;Persist Security Info=False;"
        $connection = New-Object System.Data.OleDb.OleDbConnection($connectionString)
        $connection.Open()
        $providerUsed = $provider
        break
    }
    catch {
        if ($connection) {
            $connection.Dispose()
        }
        $connection = $null
    }
}

if (-not $connection) {
    throw "Could not open Access database with ACE OLE DB 16.0 or 12.0."
}

function Convert-ToSafeFileName {
    param([string]$Name)
    return ($Name -replace '[^A-Za-z0-9_]+', '_')
}

$manifest = [ordered]@{
    source = $resolvedDb
    output_dir = $resolvedOut
    provider = $providerUsed
    exported_at = (Get-Date).ToString("o")
    tables = @()
}

try {
    $tableSchema = $connection.GetOleDbSchemaTable([System.Data.OleDb.OleDbSchemaGuid]::Tables, $null)
    $tables = $tableSchema |
        Where-Object { $_.TABLE_TYPE -eq "TABLE" -and $_.TABLE_NAME -notlike "MSys*" } |
        Sort-Object TABLE_NAME

    foreach ($table in $tables) {
        $tableName = [string]$table.TABLE_NAME
        $safeName = Convert-ToSafeFileName $tableName
        $csvPath = Join-Path $resolvedOut "$safeName.csv"

        $adapter = New-Object System.Data.OleDb.OleDbDataAdapter("SELECT * FROM [$tableName]", $connection)
        $dataSet = New-Object System.Data.DataSet
        [void]$adapter.Fill($dataSet)
        $dataTable = $dataSet.Tables[0]

        $rows = foreach ($row in $dataTable.Rows) {
            $obj = [ordered]@{}
            foreach ($col in $dataTable.Columns) {
                $value = $row[$col.ColumnName]
                if ($value -is [System.DBNull]) {
                    $obj[$col.ColumnName] = $null
                }
                else {
                    $obj[$col.ColumnName] = $value
                }
            }
            [PSCustomObject]$obj
        }

        $rows | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8

        $columnsSchema = $connection.GetOleDbSchemaTable(
            [System.Data.OleDb.OleDbSchemaGuid]::Columns,
            @($null, $null, $tableName, $null)
        ) | Sort-Object ORDINAL_POSITION

        $manifest.tables += [ordered]@{
            access_table = $tableName
            staging_table = "stg_$safeName"
            csv_file = $csvPath
            row_count = $dataTable.Rows.Count
            columns = @(
                foreach ($column in $columnsSchema) {
                    [ordered]@{
                        name = [string]$column.COLUMN_NAME
                        ordinal = [int]$column.ORDINAL_POSITION
                        access_data_type = [int]$column.DATA_TYPE
                        max_length = if ($column.CHARACTER_MAXIMUM_LENGTH -is [System.DBNull]) { $null } else { $column.CHARACTER_MAXIMUM_LENGTH }
                        nullable = if ($column.IS_NULLABLE -is [System.DBNull]) { $null } else { [bool]$column.IS_NULLABLE }
                    }
                }
            )
        }

        Write-Output "$tableName -> $csvPath ($($dataTable.Rows.Count) rows)"
    }

    $manifestPath = Join-Path $resolvedOut "manifest.json"
    $manifest | ConvertTo-Json -Depth 8 | Set-Content -Path $manifestPath -Encoding UTF8
    Write-Output "Manifest -> $manifestPath"
}
finally {
    $connection.Close()
    $connection.Dispose()
}
