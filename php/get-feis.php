<?php
	//include 'ChromePhp.php';
	//ChromePhp::log($_SERVER);
	//ChromePhp::warn('something went wrong!');
##Setting up MySQL
	$username = "root";
	$password = "#Planxty69";
	$hostname = "localhost";
	$dbname = "ifeis";

	//$mysqli = new mysqli($hostname, $username, $password, $dbname) or die("Unable to connect!");
	//$result = $mysqli->query($query);
	//echo $result->num_rows;

	if(isset($_POST['month']) && !empty($_POST['month'])){
		$month = $_POST['month'];	
	}

	$link = mysqli_connect($hostname, $username, $password, $dbname);

	if (mysqli_connect_errno()) {
		die("Unable to connect!");
	}

	$query = "SELECT feis_id as id, name, MONTH(date) as month, DAY(date) as day, YEAR(date) as year, region, place, competitors FROM feis WHERE feis_id='";


	$result = mysqli_query($link, $query);
	//$result = $mysqli->query($query);
	//ChromePhp::log($result);
	//$data;
	if (mysqli_num_rows($result)!=0) {
		while($row = mysqli_fetch_assoc($result)) {
			//ChromePhp::log($row);
			//$feis[$row['month']][] = $row;
			$feis[] = $row;
			/*array (
				'name'=>$row['name'],
				'month'=>$row['month'],
				'day'=>$row['day']
				);*/


			//$encode[$row['name']][$i] = [$row['month'],$row['day']];
		}
		//$f['feises'] = $feis; 
		//ChromePhp::log($feis);
		echo json_encode($feis);
	}
	else {
		$feis[0] = '0';
		echo json_encode($result);
	}
	/*$file = fopen("test.txt","w");
	echo fwrite($file,"Hello World. Testing!");
	fclose($file);*/
?>