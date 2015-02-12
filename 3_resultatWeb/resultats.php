<?php
	$connect = new MongoClient();
	
	// select a database
	$db = $connect->electionsdb;
	$collection = $db->electionsFinalesResultats;
	// selection des resultats pour le scrutin et l arrondissement
	$tab = $collection->find(array("insee"=>$_GET["idArr"],"libelleScrutin"=>$_GET["scrutin"]),array("nom","prenom","nbVotes","nbExprimes"));

	// Contruction du JSON : parcours de chaque candidat
	$output = "{";
	$cmp = 0;
	foreach ($tab as $doc)
	{
		if ($cmp!=0)$output .= ",";
		
		$output .= "\"".$cmp."\":{";
		$cmp2=0;
		foreach ($doc as $cle=> $valeur)
		{
			if ($cmp2!=0)$output .= ",";
			$output .= "\"".$cle."\":\"".$valeur."\"";			
			$cmp2++;
		}
		$output .= "}";
		$cmp++;
	}
	
	echo $output."}";
?>


