
<?php
	include 'ChromePhp.php';
	ChromePhp::log('hello world');
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
        	//$data = json_decode(file_get_contents('php://input'));
        	ChromePhp::log($id);
    	break;
	}

	//$query = "SELECT feis_id as id,name FROM photos WHERE feis_id='163';";
	$id = &$_GET['id'];
	$query = "SELECT * FROM photos";
	ChromePhp::log($query);
	$result = mysqli_query($link, $query);
	ChromePhp::log($result);
	//ChromePhp::log(mysqli_num_rows($result));

	if (mysqli_num_rows($result)!=0) {
		ChromePhp::log('woot');
		while($row = mysqli_fetch_assoc($result)) {
			$photos[] = $row;
		}
		//s$final = json_encode($photos);
		//$final[0].id;
		ChromePhp::log($photos);
		echo json_encode($photos);
	}
	else {
		ChromePhp::log('bah');
		$feis[0] = '0';
		echo json_encode($photos);
	}
?>