List doors:
```
curl --silent --insecure https://172.28.0.1:12445/api/v1/developer/doors -H "Accept: application/json" -H "Authorization: Bearer {token}"
```

Unlock for 2 minutes:
```
curl --silent --insecure -X PUT https://172.28.0.1:12445/api/v1/developer/doors/64ded900-3dfe-4b49-b002-428972422c65/lock_rule -H "Accept: application/json" -H "Authorization: Bearer {token}" -H "content-type: application/json" --data '{"type": "custom", "interval": 2}'
```
