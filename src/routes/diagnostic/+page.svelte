<script>
	export let data;
</script>

<div class="diagnostic">
	<h1>Database Diagnostic</h1>

	<h2>Database Status: {data.dbStatus}</h2>

	<h2>Tables:</h2>
	<ul>
		{#each data.tables as table}
			<li>{table}</li>
		{/each}
	</ul>

	<h2>User Columns:</h2>
	<table>
		<thead>
			<tr>
				<th>cid</th>
				<th>name</th>
				<th>type</th>
				<th>notnull</th>
				<th>pk</th>
			</tr>
		</thead>
		<tbody>
			{#each data.userColumns as col}
				<tr>
					<td>{col.cid}</td>
					<td>{col.name}</td>
					<td>{col.type}</td>
					<td>{col.notnull}</td>
					<td>{col.pk}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<h2>Sample Users:</h2>
	<pre>{JSON.stringify(data.sampleUsers, null, 2)}</pre>

	<h2>Session User:</h2>
	<pre>{JSON.stringify(data.sessionUser, null, 2)}</pre>
</div>

<style>
	.diagnostic {
		padding: 20px;
		font-family: monospace;
	}

	table {
		border-collapse: collapse;
		width: 100%;
	}

	th,
	td {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: left;
	}

	th {
		background-color: #f2f2f2;
	}

	pre {
		background: #f4f4f4;
		padding: 10px;
		border-radius: 5px;
		overflow: auto;
	}
</style>
