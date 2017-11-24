"use strict"

const formatsData = require('pokemon-showdown/data/formats-data').BattleFormatsData
const pokedex = require('pokemon-showdown/data/pokedex').BattlePokedex
const items = require('pokemon-showdown/data/items').BattleItems
const doublesFormatsData = Object.create(formatsData)
const formats = require('pokemon-showdown/config/formats').Formats

const formatHandlers = {
    '[Gen 7] Doubles OU': 'Uber',
    '[Gen 7] Doubles UU': 'OU',
}

const banlists = {}

for (const pokemonid in doublesFormatsData) {
    doublesFormatsData[pokemonid] = Object.create(doublesFormatsData[pokemonid])
    doublesFormatsData[pokemonid].tier = 'NU'
}

formats.forEach(function searchFormats(format) {
    if (!format.name) {
        return
    }
    const tier = formatHandlers[format.name]
    if (tier) {
        format.banlist.forEach(function applyBanlist(entry) {
            const id = toId(entry)
            const item = items[id]
            if (item && item.megaEvolves) {
                doublesFormatsData[toId(item.megaStone)].tier = tier
            }
            const pokemon = doublesFormatsData[id]
            if (pokemon) {
                pokemon.tier = tier
            }
        })
    }
})

function toId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function searchTier(formatsData, pokemonid, findMega) {
    const pokemon = pokedex[pokemonid]
    const tiers = {
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
        New: 5,
        NFE: 5,
        LC: 5,
        'LC Uber': 5,
    }
    const reverseTier = ['Uber', 'OU', 'UU', 'RU', 'NU', 'PU']
    let evos = pokemon.evos || []
    if (findMega) {
        evos = evos.concat(pokemon.otherFormes || [])
    }
    const currentTier = formatsData[pokemonid].tier
    const toSearch = evos.map(function recursiveSearch(evo) {
        return searchTier(formatsData, evo, findMega)
    }).concat(currentTier)
    return reverseTier[Math.min.apply(Math, toSearch.map(function toTierValue(tier) {
        if (tier.charAt(0) === '(') {
            tier = tier.slice(1, -1)
        }
        return tiers[tier]
    }))]
}

function hasMega(pokemon) {
    if (pokemon.species === 'Rayquaza') {
        return false // too broken
    }
    if (pokemon.otherFormes) {
        for (const id of pokemon.otherFormes) {
            const forme = pokedex[id]
            if (forme.forme.substring(0, 4) === 'Mega') {
                return formatsData[id].tier !== 'Unreleased'
            }
        }
        return false
    }
    const evos = pokemon.evos || []
    for (const evo of evos) {
        if (hasMega(pokedex[evo])) {
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
    if (num <= 721) return 6
    return 7
}

const banned = {
    burmy: 1, caterpie: 1, combee: 1, kricketot: 1, magikarp: 1, scatterbug: 1,
    sunkern: 1, tynamo: 1, weedle: 1, wurmple: 1, typenull: 1, cosmog: 1,
    poipole: 1,
}
const legendaries = {
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
    yveltal: 1, zygarde: 1, diancie: 1, hoopa: 1, hoopaunbound: 1,
    silvally: 1, tapukoko: 1, tapulele: 1, tapubulu: 1, tapufini: 1,
    solgaleo: 1, lunala: 1, nihilego: 1, buzzwole: 1, pheromosa: 1,
    xurkitree: 1, celesteela: 1, kartana: 1, guzzlord: 1, necrozma: 1,
    magearna: 1, marshadow: 1, naganadel: 1, stakataka: 1, blacephalon: 1
}

const fs = require('fs')
const output = fs.openSync('_data/pokemon.yml', 'w')

for (const pokemonid in formatsData) {
    const pokemon = pokedex[pokemonid]
    const format = formatsData[pokemonid]
    if (!legendaries[pokemonid] && (!pokemon || pokemon.prevo || !pokemon.evos || pokemon.forme || format.isNonstandard || banned[pokemonid])) continue

    const mega = false
    const tier = format.tier
    fs.writeSync(output, '- {name: ' + pokemon.species)
    fs.writeSync(output, ', legendary: ' + !!legendaries[pokemonid])
    const colors = new Map([[pokemon.color, pokemon.species]])
    for (const formeid of pokemon.otherFormes || []) {
        const formeColor = pokedex[formeid].color
        if (!colors.has(formeColor)) {
            colors.set(formeColor, pokedex[formeid].species)
        }
    }
    fs.writeSync(output, ', color: {')
    fs.writeSync(output, Array.from(colors).map(([color, specie]) => `${color}: ${specie}`).join(", "))
    fs.writeSync(output, '}, types: [' + pokemon.types.join(', ') + ']')
    const singlesTier = searchTier(formatsData, pokemonid, false)
    const doublesTier = searchTier(doublesFormatsData, pokemonid, false, [])
    fs.writeSync(output, ', tier: ' + singlesTier)
    fs.writeSync(output, ', doublesTier: ' + doublesTier)
    fs.writeSync(output, ', gen: ' + gen(pokemon.num))
    fs.writeSync(output, ', mega: ')
    if (hasMega(pokemon)) {
        fs.writeSync(output, '{tier: ' + searchTier(formatsData, pokemonid, true))
        fs.writeSync(output, ', doublesTier: ' + searchTier(formatsData, pokemonid, true))
        fs.writeSync(output, '}')
    } else {
        fs.writeSync(output, 'null')
    }
    fs.writeSync(output, '}\n')
}

fs.closeSync(output)
