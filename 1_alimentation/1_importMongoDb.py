#!/usr/bin/python
import yaml
import json
import csv
import os
import pymongo
import time

# prepare un json depuis les donnees brutes d opendata a integrer dans mongoDB
print "debut import : "+ time.strftime('%d/%m/%y %H:%M',time.localtime())

cheminFichierRevenus = os.getcwd()+"/../0_donneesBrutes/revenu.csv"
cheminFichierChomage = os.getcwd()+"/../0_donneesBrutes/chomage.csv"
cheminFichierVotes = os.getcwd()+"/../0_donneesBrutes/resultats_electoraux.json"


# creation de la base electionsdbScript dans mongodb
db = pymongo.MongoClient().electionsdb

# suppression de la table elections
db.electionsBrutes.remove()

################### 1 : recuperation des infos insee ################### 
fileRevenus = open(cheminFichierRevenus, "rb")
fileChomage = open(cheminFichierChomage, "rb")

readerRevenus= csv.reader(fileRevenus)
readerChomage= csv.reader(fileChomage)

donneesInsee=[]
pos=0
# donneesInsee est une liste d arrondissement.
# Chaque liste contient le code postal, l intitule et les revenus/le taux de chomage de l arrondissement
# parcours du fichier revenus pour stockage infos tableau temporaire
print "lecture fichier " + cheminFichierRevenus + "..."
for row in readerRevenus:
    #Ajout des donnees sur le revenu median par arrondissement
    sousliste=[]
    if str(row[0]).startswith('751'):
        sousliste.append(int(row[0]))
        sousliste.append(int(row[2]))
        donneesInsee.append(sousliste)

print "lecture fichier " + cheminFichierChomage + "..."
# parcours du fichier chomage pour stockage infos tableau temporaire
for row in readerChomage:
    #Ajout des donnees sur le chomage par arrondissement
    if str(row[0]).startswith('751'):
        donneesInsee[pos].append(float(row[2]))
        pos+=1
    
fileRevenus.close()
fileChomage.close()

# a ce stage donneesInsee est de la forme
#donneesInsee = [[75101, 31398, 8.66], [75102, 26859, 10.23], [75103, 28137, 10.19], [75104, 29610, 10.11], [75105, 32029, 8.8], [75106, 38502, 8.52], [75107, 40890, 8.61], [75108, 40099, 8.31], [75109, 29909, 9.48], [75110, 21438, 12.98], [75111, 23720, 11.35], [75112, 26198, 8.96], [75113, 21917, 11.05], [75114, 26107, 9.95], [75115, 29731, 8.5], [75116, 38205, 8.95], [75117, 28155, 11.08], [75118, 18050, 13.12], [75119, 16179, 15.34], [75120, 18252, 13.72]]


################### 2 : Integration MongoDB ################### 

json_data=open(cheminFichierVotes)

liste = json.load(json_data)

json_data.close()

# suppression des documents de la table electionsBrutes
db.electionsBrutes.remove()

cmp=0;
print "parcours fichier votes " + cheminFichierVotes + "..."   
for dictionnaire in liste:
    if (dictionnaire["fields"].has_key('nom_du_candidat_ou_liste')):
        if (dictionnaire["fields"]["nom_du_candidat_ou_liste"] != "LISTE ANNULEE"):
            dictionnaireRes={}
            # champs a utiliser dans mongoDB pour l agregation
            dictionnaireRes['numBureauVote'] = dictionnaire["fields"]["numero_de_bureau_de_vote_000_a_999"]
            dictionnaireRes['insee'] = dictionnaire["fields"]['code_commune_insee_751_01_a_20']
    
            dictionnaireRes['prenom'] = dictionnaire["fields"]["prenom_du_candidat_ou_liste"]
            dictionnaireRes['nom'] = dictionnaire["fields"]["nom_du_candidat_ou_liste"]
            dictionnaireRes['libelleScrutin'] = dictionnaire["fields"]["libelle_du_scrutin"]
            dictionnaireRes['dateScrutin'] = dictionnaire["fields"]["date_du_scrutin_jj_mm_ssaa"]
    
            # champs pour statistiques a l agregation
            dictionnaireRes['nbExprimes'] = dictionnaire["fields"]["nombre_d_exprimes_du_bureau_de_vote"]
            dictionnaireRes['nbVotes'] = dictionnaire["fields"]["nombre_de_voix_du_candidat_ou_liste_obtenues_pour_le_bureau_de_vote"]
            dictionnaireRes['nbVotants'] = dictionnaire["fields"]["nombre_de_votants_du_bureau_de_vote"]
            dictionnaireRes['nbInscrits'] = int(dictionnaire["fields"]["nombre_d_inscrits_du_bureau_de_vote"])
    
		    # donnees insee
            dictionnaireRes['revenuMedian'] = donneesInsee[int(dictionnaireRes['insee']) - 75101][1]
            dictionnaireRes['chomage'] = donneesInsee[int(dictionnaireRes['insee']) - 75101][2]

            # label qu on gardera pour l affichage
            dictionnaireRes['labelArrondissement'] = dictionnaire["fields"]["commune_paris_01_a_20"]
			
			# insertion collection brute
            db.electionsBrutes.insert(yaml.load(json.dumps(dictionnaireRes)))
            
            # info avancement
            if (cmp % 1000==0):
			    print str(cmp*100/len(liste))+"%"
            cmp=cmp+1


print "fin import : "+ time.strftime('%d/%m/%y %H:%M',time.localtime())

