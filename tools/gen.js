// TODO: Make this entire thing cleaner

var formatsData = require('Pokemon-Showdown/data/formats-data').BattleFormatsData
var pokedex = require('Pokemon-Showdown/data/pokedex').BattlePokedex

function searchTier(pokemonid, findMega) {
    var pokemon = pokedex[pokemonid]
    var tiers = {
        Uber: 0,
        OU: 1,
        BL: 1,
        UU: 2,
        BL2: 2,
        RU: 3,
        BL3: 3,
        NU: 4,
        BL4: 4,
        PU: 5,
        NFE: 5,
        LC: 5,
        'LC Uber': 5,
    }
    var reverseTier = ['Uber', 'OU', 'UU', 'RU', 'NU', 'PU']
    var evos = pokemon.evos || []
    if (findMega) {
        evos = evos.concat(pokemon.otherFormes || [])
    }
    var toSearch = evos.map(function recursiveSearch(evo) {
        return searchTier(evo, findMega)
    }).concat(formatsData[pokemonid].tier)
    return reverseTier[Math.min.apply(Math, toSearch.map(function toTierValue(tier) {
        return tiers[tier]
    }))]
}

function hasMega(pokemon) {
    if (pokemon.species === 'Rayquaza') {
        return false // too broken
    }
    if (pokemon.otherFormes) {
        for (var i = 0; i < pokemon.otherFormes.length; i++) {
            var forme = pokedex[pokemon.otherFormes[i]]
            if (forme.forme.substring(0, 4) === 'Mega') {
                return true
            }
        }
        return false
    }
    var evos = pokemon.evos || []
    for (var i = 0; i < evos.length; i++) {
        if (hasMega(pokedex[evos[i]])) {
            return true
        }
    }
    return false
}

function gen(num) {
    if (num <= 151) return 1
    if (num <= 251) return 2
    if (num <= 386) return 3
    if (num <= 493) return 4
    if (num <= 649) return 5
    return 6
}

var banned = {caterpie: 1, weedle: 1, magikarp: 1, sunkern: 1, wurmple: 1, scatterbug: 1}
var legendaries = {
    articuno: 1, zapdos: 1, moltres: 1, mewtwo: 1, mew: 1, raikou: 1,
    entei: 1, suicune: 1, lugia: 1, hooh: 1, celebi: 1, regirock: 1,
    regice: 1, registeel: 1, latias: 1, latios: 1, kyogre: 1, groudon: 1,
    rayquaza: 1, jirachi: 1, deoxys: 1, deoxysattack: 1, deoxysdefense: 1,
    deoxysspeed: 1, uxie: 1, mesprit: 1, azelf: 1, dialga: 1, palkia: 1,
    heatran: 1, regigigas: 1, manaphy: 1, giratina: 1, giratinaorigin: 1,
    cresselia: 1, darkrai: 1, shaymin: 1, shayminsky: 1, arceus: 1,
    victini: 1, cobalion: 1, terrakion: 1, virizion: 1, tornadus: 1,
    thundurus: 1, tornadustherian: 1, thundurustherian: 1, reshiram: 1,
    zekrom: 1, landorus: 1, landorustherian: 1, kyurem: 1, kyuremblack: 1,
    kyuremwhite: 1, keldeo: 1, meloetta: 1, genesect: 1, xerneas: 1,
    yveltal: 1, zygarde: 1, diancie: 1, hoopa: 1, hoopaunbound: 1
}

var fs = require('fs')
var output = fs.openSync('_data/pokemon.yml', 'w')

for (var pokemonid in formatsData) {
    var pokemon = pokedex[pokemonid]
    var format = formatsData[pokemonid]
    if (!legendaries[pokemonid] && (pokemon.prevo || !pokemon.evos || pokemon.forme || format.isNonstandard || banned[pokemonid])) continue

    var mega = false
    var tier = format.tier
    fs.writeSync(output, '- name: ' + pokemon.species + '\n')
    fs.writeSync(output, '  legendary: ' + !!legendaries[pokemonid] + '\n')
    fs.writeSync(output, '  color: ' + pokemon.color + '\n')
    fs.writeSync(output, '  types: [' + pokemon.types.join(', ') + ']\n')
    var tier = searchTier(pokemonid, false)
    fs.writeSync(output, '  tier: ' + searchTier(pokemonid, false) + '\n')
    fs.writeSync(output, '  gen: ' + gen(pokemon.num) + '\n')
    fs.writeSync(output, '  mega:\n')
    if (hasMega(pokemon)) {
        fs.writeSync(output, '    tier: ' + (searchTier(pokemonid, true) || tier) + '\n')
    }
    fs.writeSync(output, '\n')
}

fs.close(output)
