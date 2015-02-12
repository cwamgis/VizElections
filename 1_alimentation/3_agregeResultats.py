#!/usr/bin/python

# script permettant d agreger les donnees pour la consultation des resultats  par arrondissement et scrutin

import pymongo
import yaml
import json
import time

# verif ok pour nbExprimes
print "debut agreg resultats des votes : "+ time.strftime('%d/%m/%y %H:%M',time.localtime())

# connexion a la base
db = pymongo.MongoClient().electionsdb

# Recuperation du nb d exprimes et du nb d inscrits par bureau de vote

#selection distincte de nbExprimes, nbInscrits pour chaque bureau de vote pour une election donnee
# on prend comme operateur min, peu importe le tout c est de recuperer la valeur pour chaque regroupement
print "agregation..."
agregParBureau = db.electionsBrutes.aggregate([{"$group":{"_id":{"insee":"$insee","nom":"$nom","prenom":"$prenom","libelleScrutin":"$libelleScrutin","dateScrutin":"$dateScrutin"},"nbVotes":{"$sum":"$nbVotes"},"nbExprimes":{"$sum":"$nbExprimes"}}}])

# On vide la table finale
db.electionsFinalesResultats.remove()

for dictionnaire in agregParBureau["result"]:
	dictionnaireInsert			= {}
	
	dictionnaireInsert["insee"] = dictionnaire["_id"]["insee"]
	dictionnaireInsert["nom"] = dictionnaire["_id"]["nom"]
	dictionnaireInsert["prenom"] = dictionnaire["_id"]["prenom"]
	dictionnaireInsert["libelleScrutin"] = dictionnaire["_id"]["libelleScrutin"]
	dictionnaireInsert["dateScrutin"] = dictionnaire["_id"]["dateScrutin"]
	
	dictionnaireInsert["nbExprimes"] = dictionnaire["nbExprimes"]
	dictionnaireInsert["nbVotes"] = dictionnaire["nbVotes"]

	db.electionsFinalesResultats.insert(yaml.load(json.dumps(dictionnaireInsert)))

print "fin agreg : "+ time.strftime('%d/%m/%y %H:%M',time.localtime())
