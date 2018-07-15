<?php
$content = $_POST["content"];
$file_name = "./" . $_POST["filename"];

file_put_contents($file_name, $content);
?>

<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>sample</title>
	</head>
	<body>
		<p>
			結果は送信されました
		</p>
		<ul>
		</ul>
	</body>
</html>