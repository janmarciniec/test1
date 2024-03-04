<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<link rel="icon" type="image/svg+xml" href="/mapplic-admin/public/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
		<title>mapplic</title>
		<style>
			body {
				font-family: sans-serif;
			}
			#content {
				margin: 16px auto;
				max-width: 1000px;
				padding: 0 16px;
			}
		</style>
		<link rel="stylesheet" type="text/css" href="/dist/mapplic/mapplic.css">
	</head>
	<body>
		<a href="index-admin.html">Admin panel</a>
		<div id="content">
			<mapplic-map id="map" data-json="data.json"/>
		</div>

		<script id="mapplic-script" type="module" src="/mapplic/dist/mapplic.js"></script>
	</body>
</html>