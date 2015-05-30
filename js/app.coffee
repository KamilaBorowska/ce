---
---

uniq = (list) ->
  results = []
  for value in list
    if value isnt previousValue
      results.push value
    previousValue = value
  results

shuffle = (list) ->
  n = list.length
  while n > 1
    r = Math.floor(n * Math.random())
    n -= 1
    [list[n], list[r]] = [list[r], list[n]]
  list

angular.module 'ceApp', []
.controller 'CeController', ['$http', ($http) ->
  @pokemon = []
  $http.get 'json/pokemon.json'
  .success (data) =>
    @pokemon = data

    typeExists = {}
    colorExists = {}
    for pokemon in @pokemon
      colorExists[pokemon.color] = yes
      for type in pokemon.types
        typeExists[type] = yes

    @formatNameToFormat.Monotype.configuration.values = (type for type of typeExists).sort()
    @formatNameToFormat.Monocolor.configuration.values = (color for color of colorExists).sort()
    @updateListOfPokemon()

  @randomPokemon = []
  @megas = yes

  @tiers =
    Uber: 0
    OU: 1
    UU: 2
    RU: 3
    NU: 4
    PU: 5

  getTierCallback = (tier) =>
    (pokemon) =>
      unless @megas
        return false if pokemon.mega and @tiers[pokemon.mega.tier] >= @tiers[tier]
      @tiers[pokemon.tier] >= @tiers[tier] and not pokemon.legendary

  @checkMega = (pokemon) ->
    if @megas
      true
    else
      not pokemon.mega

  @formats = [
    name: 'Regular'
    callback: getTierCallback 'OU'
  ,
    name: 'Monotype'
    callback: (pokemon) =>
      not pokemon.legendary and @configuration in pokemon.types and @checkMega pokemon
    configuration:
      label: 'Type'
  ,
    name: 'Monocolor'
    callback: (pokemon) =>
      not pokemon.legendary and pokemon.color is @configuration and @checkMega pokemon
    configuration:
      label: 'Color'
  ,
    name: 'Monoregion'
    callback: (pokemon) =>
      not pokemon.legendary and @checkMega(pokemon) and pokemon.gen is 1 + @formatNameToFormat.Monoregion.configuration.values.indexOf @configuration
    configuration:
      label: 'Region'
      values: ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos']
  ,
    name: 'UU'
    callback: getTierCallback 'UU'
  ,
    name: 'RU'
    callback: getTierCallback 'RU'
  ,
    name: 'NU'
    callback: getTierCallback 'NU'
  ,
    name: 'Ubers'
    callback: getTierCallback 'Uber'
  ,
    name: 'Legendary'
    callback: (pokemon) =>
      pokemon.legendary and @checkMega pokemon
  ]

  @format = @formats[0]

  @formatNameToFormat = {}
  for format in @formats
    @formatNameToFormat[format.name] = format

  @getAllowedPokemon = ->
    pokemon.name for pokemon in @pokemon.filter @format.callback

  @getPossibleParticipants = ->
    allowedPokemon = @getAllowedPokemon()
    i = 8
    result = []
    while i <= allowedPokemon.length
      result.push i
      i *= 2
    result

  @updateListOfPokemon = ->
    @randomPokemon = shuffle @getAllowedPokemon()
    @rerolls = (0 for i in @randomPokemon)

  @repeatParticipants = ->
    [1..@participants]

  @replace = (i) ->
    @rerolls[i] += 1
    r = +@participants + Math.floor Math.random() * (@randomPokemon.length - +@participants)
    [@randomPokemon[i], @randomPokemon[r]] = [@randomPokemon[r], @randomPokemon[i]]

  @removeConfiguration = ->
    @configuration = null
]
