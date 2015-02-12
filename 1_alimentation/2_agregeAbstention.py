#!/usr/bin/python

# script permettant d agreger les donnees pour la consultation du taux d abstention par arrondissement

import pymongo
import yaml
import json
import time

# verif ok pour nbExprimes
print "debut agreg : "+ time.strftime('%d/%m/%y %H:%M',time.localtime())

# connexion a la base
db = pymongo.MongoClient().electionsdb

# Recuperation du nb d exprimes et du nb d inscrits par bureau de vote

#selection distincte de nbExprimes, nbInscrits pour chaque bureau de vote pour une election donnee (pour suppression ds doublons)
# on prend comme operateur min, peu importe le tout c est de recuperer la valeur pour chaque regroupement
print "premiere agregation..."
agregParBureau = db.electionsBrutes.aggregate([{"$group":{"_id":{"insee":"$insee","numBureauVote":"$numBureauVote","libelleScrutin":"$libelleScrutin"},"nbInscritsParBureauEtElection":{"$min":"$nbInscrits"},"nbExprimesParBureauEtElection":{"$min":"$nbExprimes"},"chomage":{"$min":"$chomage"},"revenuMedian":{"$min":"$revenuMedian"}}}])

# On vide la table d agregation temporaire
db.agregtmp.remove()

for dictionnaire in agregParBureau["result"]:
	dictionnaireInsert			= {}
	dictionnaireInsert["insee"] = dictionnaire["_id"]["insee"]
	dictionnaireInsert["libelleScrutin"] = dictionnaire["_id"]["libelleScrutin"]
	dictionnaireInsert["numBureauVote"]  = dictionnaire["_id"]["numBureauVote"]
	dictionnaireInsert["nbExprimes"] = dictionnaire["nbExprimesParBureauEtElection"]
	dictionnaireInsert["nbInscrits"] = dictionnaire["nbInscritsParBureauEtElection"]
	dictionnaireInsert['revenuMedian'] = dictionnaire["revenuMedian"]
	dictionnaireInsert['chomage'] = dictionnaire["chomage"]
	db.agregtmp.insert(yaml.load(json.dumps(dictionnaireInsert)))

print "deuxieme agregation..."	
# agregation par arrondissement
agregParArr = db.agregtmp.aggregate([{"$group":{"_id":{"insee":"$insee","libelleScrutin":"$libelleScrutin"},"nbInscritsParArrEtElection":{"$sum":"$nbInscrits"},"nbExprimesParArrEtElection":{"$sum":"$nbExprimes"},"chomage":{"$min":"$chomage"},"revenuMedian":{"$min":"$revenuMedian"}}}])

# On vide la table finale
db.electionsFinales.remove()

for dictionnaire in agregParArr["result"]:
	dictionnaireInsert			= {}
	dictionnaireInsert["insee"] = dictionnaire["_id"]["insee"]
	dictionnaireInsert["libelleScrutin"] = dictionnaire["_id"]["libelleScrutin"]
	dictionnaireInsert["nbExprimes"] = dictionnaire["nbExprimesParArrEtElection"]
	dictionnaireInsert["nbInscrits"] = dictionnaire["nbInscritsParArrEtElection"]
	dictionnaireInsert['revenuMedian'] = dictionnaire["revenuMedian"]
	dictionnaireInsert['chomage'] = dictionnaire["chomage"]
	db.electionsFinales.insert(yaml.load(json.dumps(dictionnaireInsert)))

print "fin agreg : "+ time.strftime('%d/%m/%y %H:%M',time.localtime())
