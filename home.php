<?php
error_reporting(E_ALL & ~E_NOTICE);
if (!isset($_SESSION)){
    session_start();
}
if (!isset($_SESSION['logged_user'])) {
    header('Location: index.php');
}
else if (!isset($_GET['userID'])){
    require_once 'config.php';
    $mysqli = new mysqli(DB_HOST,DB_USER,DB_PASSWORD,DB_NAME);
    if ($mysqli->errno){
        print('There was an error in connecting to the database:');
        print($mysqli->error);
        exit();
    }
    $username = $_SESSION['logged_user'];
    $userQuery = $mysqli -> query("SELECT userID FROM Users WHERE username = '$username'");
    $row = $userQuery -> fetch_assoc();
    $userID = $row['userID'];
    header("Location: home.php?userID=$userID");
}
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />
    <!-- CSS Stylesheets -->
    <link rel="stylesheet" type="text/css" href="css/bootstrap.css">
    <link rel="stylesheet" type="text/css" href="css/ionicons.css">
    <link rel="stylesheet" type="text/css" href="css/style.css">
    <!-- JavaScript -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>StockFu | Home</title>
</head>

<body> 
    <div class="container">
        <?php include 'navbar.php';
            /* Display all user charts */

            if (isset($_GET['userID'])) {
                require_once 'config.php';
                $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
                /*Check if userID = logged_user and display their charts*/
                $userID = $_GET['userID'];
                $username = $_SESSION['logged_user'];
                $query  = "SELECT userID FROM Users WHERE username = '$username'";
                $result = $mysqli->query($query);
                if ($result == false) {
                    print("<h1>...Who are you?</h1>");
                }
                $row = $result -> fetch_assoc();
                $logged_userID = $row['userID'];
                if ($logged_userID == $userID) {
                    /*current user = userID*/
                    $userID = $_GET['userID'];
                    $query  = "SELECT * FROM Charts WHERE userID = $userID";
                    $result = $mysqli->query($query);
                    if ($result) {
                        echo "<div id=\"body\">
                            <div class=\"row\">
                                <div>
                                    <h1 class=\"page-title\">Your Charts<h1>
                                </div>
                             </div>";
                        echo "<div class=\"row\" id=\"bucket\">";
                        while ($row = $result -> fetch_assoc()){
                            $chartID = $row['chartID'];
                            $symbol = $row['name'];
                            // Converts yyyy-mm-dd dates to Unix timestamp, then to Month day, year format
                            $startDate = date('F d, Y', strtotime($row['startDate']));
                            $endDate = date('F d, Y', strtotime($row['endDate']));
                            $chartName = $row['chartName'];
                            $svg = str_replace("width=\"1000px\"", "width=\"380px\"", $row['svg_string']);
                            $svg = str_replace("height=\"500px\"", "height=\"230px\"", $svg);
                            $svg = str_replace("id=\"newChart\"", "class=\"backgroundSvg\"", $svg);

                            echo "
                                <div class=\"col-md-4\" id=\"stock\">
                                    <a href=\"viewChartPrivate.php?chartID=$chartID\">
                                    <h1 class=\"symbol\">$symbol</h1>
                                    <h4 class=\"company\">$chartName</h4>
                                    <p class=\"dates\">$startDate to $endDate</p>
                                    </a>
                                </div>";
                        }
                    }
                    echo '
                    <div class="col-md-4" id="stock">
                            <a href="makeNew.php">
                                <h1 class="icon ion-plus" id="plus-sign"></h1>
                            </a>
                    </div></div>';
                }
                else {
                    die('This user is not logged in. You must log in to see your charts.');
                }
            }
        ?>
        <div id="footer">
            <footer>
                    Copyright &copy; 2016 The Web Development Group. All rights reserved.
            </footer>
        </div>
    </div>
</body>
</html>
