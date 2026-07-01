# Afen Query Language

AQL is the query syntax used by `afen query`.

AQL currently returns a parsed query AST. It validates query shape, fields, filters, limits, time ranges, and aggregate pipes.

## Case-Insensitive Collection Names

Collection names are case-insensitive.

These are both valid:

```powershell
afen query "SELECT * FROM errors"
afen query "SELECT * FROM ERRORS"
```

This means users do not need to remember exact uppercase or lowercase collection spelling.

## SELECT

```powershell
afen query "SELECT * FROM errors"
afen query "SELECT id FROM errors"
afen query "SELECT message FROM errors"
```

## FIND

```powershell
afen query "FIND ERRORS"
afen query "FIND ERRORS WHERE id == 1"
afen query "FIND errors WHERE severity == high"
afen query 'FIND ERRORS WHERE severity == "high"'
```

## FILTER

```powershell
afen query "SELECT * FROM errors FILTER severity >= 3"
afen query 'SELECT message FROM errors FILTER status != "resolved"'
```

Supported comparison operators:

```text
==
!=
>
>=
<
<=
```

## AND / OR

```powershell
afen query "SELECT * FROM errors FILTER severity == 3 AND status == 1"
afen query "SELECT * FROM errors FILTER severity == 3 OR status == 1"
```

## TIME

```powershell
afen query "SELECT * FROM errors TIME last 15m"
```

Supported shape:

```text
TIME last <number><unit>
```

Example units:

```text
m
h
d
```

## LIMIT

```powershell
afen query "SELECT * FROM errors LIMIT 10"
```

`LIMIT` requires a number.

## Pipes

AQL supports aggregate pipes using `|>`.

```powershell
afen query "SELECT * FROM errors |> COUNT"
afen query "SELECT * FROM errors |> RANK(severity, count)"
```

## Valid Query Examples

```powershell
afen query "SELECT * FROM errors"
afen query "SELECT * FROM ERRORS"
afen query "SELECT id FROM errors"
afen query "FIND ERRORS"
afen query "FIND ERRORS WHERE id == 1"
afen query 'FIND ERRORS WHERE severity == "high"'
afen query 'SELECT message FROM errors FILTER status != "resolved"'
afen query "SELECT * FROM errors TIME last 15m"
afen query "SELECT * FROM errors LIMIT 10"
afen query "SELECT * FROM errors FILTER severity >= 3"
afen query "SELECT * FROM errors FILTER severity == 3 AND status == 1"
afen query "SELECT * FROM errors FILTER severity == 3 OR status == 1"
afen query "SELECT * FROM errors |> COUNT"
afen query "SELECT * FROM errors |> RANK(severity, count)"
```

## Invalid Query Examples

These should return an invalid syntax error:

```powershell
afen query "SELECT"
afen query "SELECT *"
afen query "SELECT * FROM"
afen query "SELECT * FROM errors LIMIT nope"
afen query "SELECT * FROM errors FILTER severity =="
afen query "SELECT * FROM errors FILTER severity == 3 AND"
afen query "SELECT * FROM errors |> UNKNOWN"
afen query "SELECT * FROM errors FILTER"
afen query "FIND ERRORS WHERE"
afen query "FIND ERRORS WHERE severity"
```
