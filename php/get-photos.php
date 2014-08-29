
<?php
	//include 'ChromePhp.php';
	//ChromePhp::log('hello world');
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

	$request_method = strtolower($_SERVER['REQUEST_METHOD']);
	$id = null;
	switch ($request_method) {
    	case 'get':
    		$id = &$_GET['id'];
    	break;
	}

	$id = &$_GET['id'];
	$query = "SELECT * FROM photos";
	$result = mysqli_query($link, $query);

	if (mysqli_num_rows($result)!=0) {
		while($row = mysqli_fetch_assoc($result)) {
			$photos[] = $row;
		}
		echo json_encode($photos);
	}
	else {
		$feis[0] = '0';
		echo json_encode($photos);
	}
?>