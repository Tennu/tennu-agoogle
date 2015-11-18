# tennu-agoogle
### Tennu Advanced Google Command

A plugin for the [tennu](https://github.com/Tennu/tennu) irc framework.

Returns results from google. Requires admin, but supports [cooldowns](https://github.com/LordWingZero/tennu-admin-cooldown) for usage by everyone.

### Configuration

- **limitResults**: the number of results that the application would like to recieve. Values can be any integer between 1 and 8. Alternately, a value of small indicates a small result set size or 4 results. A value of large indicates a large result set or 8 results. [1](https://developers.google.com/web-search/docs/reference?hl=en)
- **maxUserDefinedLimit**: users can pass -l=8 unless you set a max using this

```Javascript
"agoogle":{
  "limitResults": 1,
  "maxUserDefinedLimit": 3
}
```

### Usage

- **!google** [-l] <query>
- - **-l** limit 1-8 (overrides config result limit) 

### Requires

[tennu-admin](https://github.com/Tennu/tennu-admin)

### Additional features

[Works with tennu-cooldown](https://github.com/LordWingZero/tennu-cooldown)

### Installing Into Tennu

See Downloadable Plugins [here](https://tennu.github.io/plugins/).

### Todo:

- Tests
