# Afen Query Language (AQL)

AQL is a declarative language to interact with Afen's reasoning engine.

## Commands

### `TRACE`

Follows the causal chain from an error node to its root cause(s).

```sql
TRACE <error_id> MAX_DEPTH <n>
```

### `CAUSE`

Lists direct causes with confidence scores.

```sql
CAUSE <error_id>
```

### `EXPLAIN`

Generates a human-readable explanation.

```sql
EXPLAIN <error_id> FORMAT text|json
```

### `COUNT`

Returns occurrence count for a fingerprint or all errors.

```sql
COUNT <fingerprint>
```

### `RANK`

Lists top fingerprints by frequency.

```sql
RANK <limit>
```

### `PREDICT`

Forecasts error rate for the next hour.

```sql
PREDICT <fingerprint> TIME last <interval>
```

## Example

```sql
EXPLAIN latest
```

Output:

```json
{
  "rootCause": {
    "nodeId": "payment_service",
    "cascades": ["TypeError: ...", "ValueError: ..."]
  },
  "recommendation": "Fix missing config in payment service and refresh token in Python worker."
}
```