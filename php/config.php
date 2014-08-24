
<?php
	include 'ChromePhp.php';
	//ChromePhp::log($_SERVER);
	//ChromePhp::warn('something went wrong!');
##Setting up MySQL
	$username = "root";
	$password = "#Planxty69";
	$hostname = "localhost";
	$dbname = "ifeis";

	$request_method = strtolower($_SERVER['REQUEST_METHOD']);

	if(isset($_POST['month']) && !empty($_POST['month'])){
		$month = $_POST['month'];	
	}

	$link = mysqli_connect($hostname, $username, $password, $dbname);

	if (mysqli_connect_errno()) {
		die("Unable to connect!");
	}


	//$data = json_decode(file_get_contents('php://input'));
	if (empty($_GET)) {
		ChromePhp::log('bah');
	}
	$dancerid = $_GET['dancerid'];
	$query = "SELECT feis_id as id, name, MONTH(date) as month, DAY(date) as day, YEAR(date) as year, region, place, competitors, placement as placementbool FROM feis WHERE dancer_id = '".$dancerid."' GROUP BY date";

	$result = mysqli_query($link, $query);
	if (mysqli_num_rows($result)!=0) {
		while($row = mysqli_fetch_assoc($result)) {
			$feis[] = $row;
		}
		echo json_encode($feis);
	}
	else {
		$feis[0] = '0';
		//echo json_encode($result);
	}
?>