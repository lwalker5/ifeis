<?php
	//include 'ChromePhp.php';
	$username = "root";
	$password = "#Planxty69";
	$hostname = "localhost";
	$dbname = "ifeis";

	if(isset($_POST['month']) && !empty($_POST['month'])){
		$month = $_POST['month'];	
	}

	$link = mysqli_connect($hostname, $username, $password, $dbname);

	if (mysqli_connect_errno()) {
		die("Unable to connect!");
	}

	$query = "SELECT feis_id as id, name, MONTH(date) as month, DAY(date) as day, YEAR(date) as year, region, place, competitors FROM feis WHERE feis_id='";


	$result = mysqli_query($link, $query);
	if (mysqli_num_rows($result)!=0) {
		while($row = mysqli_fetch_assoc($result)) {
			$feis[] = $row;
		}
		echo json_encode($feis);
	}
	else {
		$feis[0] = '0';
		echo json_encode($result);
	}
?>