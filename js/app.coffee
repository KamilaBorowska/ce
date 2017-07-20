---
---

shuffle = (list) ->
  n = list.length
  while n > 1
    r = Math.floor(n * Math.random())
    n -= 1
    [list[n], list[r]] = [list[r], list[n]]
  list

class Player
  name: ""
  rerolls: 0
  constructor: (@controller, @pokemons) ->

  replace: ->
    @rerolls += 1
    {players} = @controller
    r = +@controller.participants + Math.floor Math.random() * (players.length - +@controller.participants)
    [@pokemons, players[r].pokemons] = [players[r].pokemons, @pokemons]

angular.module 'ceApp', []
.controller 'CeController', ['$http', ($http) ->
  window.onbeforeunload = (e) =>
    if @players.length >= @participants
      "Are you sure you want to leave this page and lose list of Pokémon?"

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

  @players = []
  @megas = yes

  @tiers =
    Uber: 0
    OU: 1
    UU: 2
    RU: 3
    NU: 4
    PU: 5

  @checkTier = (tier, pokemon) ->
      @tiers[pokemon.tier] >= @tiers[tier] and not pokemon.legendary and @checkMega pokemon, tier

  @checkDoublesTier = (tier, pokemon) ->
      @tiers[pokemon.doublesTier] >= @tiers[tier] and not pokemon.legendary and @checkDoublesMega pokemon, tier

  @checkMega = (pokemon, tier) ->
    if @megas
      true
    else
      not pokemon.mega or @tiers[pokemon.mega.tier] < @tiers[tier]

  @checkDoublesMega = (pokemon, tier) ->
    if @megas
      true
    else
      not pokemon.mega or @tiers[pokemon.mega.doublesTier] < @tiers[tier]

  @formats = [
    name: 'Regular'
    callback: @checkTier.bind this, 'OU'
  ,
    name: 'Doubles'
    callback: @checkDoublesTier.bind this, 'OU'
    doubles: yes
  ,
    name: 'Monotype'
    callback: (pokemon) =>
      @configuration in pokemon.types and @checkTier 'OU', pokemon
    configuration:
      label: 'Type'
  ,
    name: 'Monocolor'
    callback: (pokemon) =>
      pokemon.color is @configuration and @checkTier 'OU', pokemon
    configuration:
      label: 'Color'
  ,
    name: 'Monoregion'
    callback: (pokemon) =>
      regions = @formatNameToFormat.Monoregion.configuration.values
      pokemon.gen is 1 + regions.indexOf(@configuration) and @checkTier 'OU', pokemon
    configuration:
      label: 'Region'
      values: ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola']
  ,
    name: 'UU'
    callback: @checkTier.bind this, 'UU'
  ,
    name: 'RU'
    callback: @checkTier.bind this, 'RU'
  ,
    name: 'NU'
    callback: @checkTier.bind this, 'NU'
  ,
    name: 'PU'
    callback: @checkTier.bind this, 'PU'
  ,
    name: 'Ubers'
    callback: @checkTier.bind this, 'Uber'
  ,
    name: 'Legendary'
    callback: (pokemon) =>
      pokemon.legendary and @checkMega pokemon, 'Uber'
  ]

  @format = @formats[0]

  @formatNameToFormat = {}
  for format in @formats
    @formatNameToFormat[format.name] = format

  @getAllowedPokemon = ->
    pokemon.name for pokemon in @pokemon.filter @format.callback

  @getPossibleParticipants = ->
    i = 8
    maxFormatPlayers = @getMaxFormatPlayers()
    result = []
    while i <= @players.length and i isnt maxFormatPlayers
      result.push i
      i *= 2
    result

  @getMaxFormatPlayers = ->
    2 ** (6 / @getNumberOfPokemon() + 1)

  @getNumberOfPokemon = ->
    if @format.doubles
      2
    else
      1

  @getMaxParticipants = ->
    participants = @getPossibleParticipants()
    participants[participants.length - 1]

  @updateListOfPokemon = ->
    shuffled = shuffle @getAllowedPokemon()
    pokemonCount = @getNumberOfPokemon()
    @players = while shuffled.length >= pokemonCount
      new Player this, shuffled.splice -pokemonCount

  @removeConfiguration = ->
    @configuration = null
]
.directive 'selectOnClick', ->
  restrict: 'A'
  link: (scope, element) ->
    element.on 'click', ->
      @select()
