<html>

<head>

	<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
	<meta name="author" content="Kim Albertsson">
	
	<title>Shady Business!</title>

	<script src="http://code.jquery.com/jquery-1.10.2.min.js" type="text/javascript"></script>

	<link rel="stylesheet" type="text/css" href="css/sb.css"     >
	<link rel="stylesheet" type="text/css" href="http://www.shadybusiness.se/css/navbar.css" >

	<?php require "include/variables.php" ?>

</head>

<!-- Kommentera mig mera -->
<body style="height:100%; overflow:hidden; margin:0px; padding:0px" >

	<?php require "include/navbar.php" ?>

	<div id="content">
		<div id="content_scroll">
		
			<?php putBlogPosts() ?>

		</div>
	</div>

	<!--<?php require "include/footer.php" ?>-->

</body>

</html>