# Initialize

```
reaction initialize

when Authenticating.register () : (user)

then Tagging.createTag (user, "Studied")
```
