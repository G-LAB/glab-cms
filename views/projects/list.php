<script type="text/javascript">
	$(function() {
		$("#projectList").accordion({ active: <?=$focus?>, autoHeight: false });	
				
		$("#dialogNewProject").dialog({
			bgiframe: true,
			autoOpen: false,
			autoHeight: true,
			width: 400,
			modal: false,
			resizable: false,
			title: 'Create New Project',
			buttons: {
				'Create Project': function() { 
					var str = $("form",this).serialize();
					$.post("<?=site_url('projects/ajax/newProject')?>", str,
					  function(data){
					    window.location = '<?=site_url('projects/view')?>/';
					});
					$(this).dialog('close');
				},
				Cancel: function() {
					$(this).dialog('close');
				}
			},
			close: function() {
				$("#dialogNewProject form")[0].reset();
				$("#entitySearch").removeAttr("disabled");
				$("#entityAccount").html('');
			}
		});
		$("#dialogNewTask").dialog({
			bgiframe: true,
			autoOpen: false,
			autoHeight: true,
			width: 400,
			modal: false,
			resizable: false,
			title: 'Create New Task',
			buttons: {
				'Save Task': function() {
					var str = $("form",this).serialize();
					var pjid = $("#taskPjid",this).val();
					$.post("<?=site_url('projects/ajax/newTask')?>", str,
					  function(data){
					    if (data == true) window.location = '<?=site_url('projects/view/')?>/' + pjid;
					    else alert('Error.');
					});
					$(this).dialog('close');
				},
				Cancel: function() {
					$(this).dialog('close');
				}
			},
			close: function() {
				$("form",this)[0].reset();
			}
		});
		$("#dialogCancelProject").dialog({
			bgiframe: true,
			autoOpen: false,
			autoHeight: true,
			width: 400,
			modal: false,
			resizable: false,
			title: 'Cancel Project',
			buttons: {
				'Cancel Project': function() { 
					var str = $("form",this).serialize();
					$.post("<?=site_url('projects/ajax/updateProject')?>", str,
					  function(data){
					    if (data == true) window.location = '<?=site_url('projects/view')?>/';
					    else alert('Error.');
					});
					$(this).dialog('close');
				},
				Cancel: function() {
					$(this).dialog('close');
				}
			},
			close: function() {	}
		});
		$(".ui-dialog").wrap('<div id="dialogContainer" class="ui-style"></div>');
		
		$('#dateStart').datepicker({
			changeMonth: true,
			changeYear: true
		});
		$('#dateDue').datepicker({
			changeMonth: true,
			changeYear: true
		});
		$(".ui-datepicker").wrap('<div id="datepickerContainer" class="ui-style"></div>');
		
		// Select Client
		$("#entitySearch").autocomplete("/backend/index.php/autocomplete/entitySearch", {
			width: 450,
			selectFirst: false
		});
		$("#entitySearch").result(function(event, data, formatted) {
			if (data)
				$("#entitySearch + input").val(data[1]);
				$(this).attr("disabled","disabled");
				$("#entityAccount").html("Account: " + data[2]);
		});
		
		$(".pbar").progressbar();
		$(".taskItem .pbar").click( function () {
			alert('Pregress Update Dialog Here');
		});
		<?php foreach ($projects as $project) : ?>
		$('#project-<?=$project['pjid']?> .pbar').progressbar('option', 'value', <?=round($project['avgComplete']*100,0)?>);<?php endforeach; 
		?>
		
		//Buttons Events
		$("#btnNewProject").click(function () { 
	  		$("#dialogNewProject").dialog('open');
		});
		
		$("a.newTask").click(function () { 
	  		var pjid   = $('span.dataPjid',this).text();
	  		var pjidName   = $('#projectName-' + pjid).text();
	  		
	  		var ptskid = $('span.dataTskid',this).text();
	  		var ptskidName = $('#task-' + ptskid + ' span.name').text();
	  		
	  		$("#taskPjid").val( pjid );
	  		$("#taskPtskid").val( ptskid );
	  		$("#taskProjName").val( pjidName );
	  		$("#taskPtaskName").val( ptskidName );
	  		$("#dialogNewTask").dialog('open');
		});
		
		$("a.cancelProject").click(function () { 
	  		var pjid   = $('span.dataPjid',this).text();
	  		var pjidName   = $('#projectName-' + pjid).text();
	  		$("#cancelPjid").val( pjid );
	  		$("#dialogCancelProject span.projectName").html( pjidName );
	  		$("#dialogCancelProject").dialog('open');
		});
		
	});
	
</script>

<?php $this->load->helper('snippet'); ?>
<h3>Projects & Tasks</h3>
<div class="buttonBar justr">
	<a href="#" id="btnNewProject" class="button add">New Project</a>
</div>
<div id="projectList">
<?php foreach ($projects as $project) : ?>
    <div class="projectEntry lineItem ui-style" id="projectEntry-<?=$project['pjid']?>">
    	<span class="name rtrim" id="projectName-<?=$project['pjid']?>"><?=$project['name']?></span>
    	<a href="#" class="newTask" title="Create New Task">New Task<span class="dataPjid"><?=$project['pjid']?></span></a>
    	<a href="#" class="cancelProject" title="Cancel Project">Cancel Project<span class="dataPjid"><?=$project['pjid']?></span></a>
    	<div class="clear"></div>
    </div>
    <div id="projectLower-<?=$project['pjid']?>">
    	<div id="project-<?=$project['pjid']?>" class="projectDetails ui-style">
			<?php if($project['description'] != null): ?>
			<p class="description">
				<?=$project['description']?>
			</p>
			<?php endif; ?>
			
			<div>
				<div class="pbar onSchedule<?=$project['onSchedule']?>"></div>
				<span class="label">Account: </span>
							<?=entity_link($project['eid'],$project['entity_name'],'G LAB',true)?> 
				<span class="label">Schedule: </span>	
							<?php
								if (isset($project['tsDue'])) {
									if (isset($project['tsStart'])) echo date('n/j/y',strtotime($project['tsStart'])).' - ';
									else echo 'Completed by ';
									echo date('n/j/y',strtotime($project['tsDue']));
								} elseif ($project['status'] == 2) echo 'TBD';
								else echo 'Unknown.';
							?>
				<div class="clear"></div>
			</div>
    	</div>
    	<?php foreach ($project['tasks'] as $id=>$task) $this->load->view('projects/list_items', $project['tasks'][$id]) ?>
    </div>
<?php endforeach; ?>
</div>



<div id="dialogs" class="ui-helper-hidden">
	<div id="dialogNewProject">
		<p>
			The following form will create a new project under which you can assign 
			tasks to employees and contractors of G LAB.
		</p>
		<form class="generic">
			<div>
				<label>Project Name</label>
				<input name="name"/>

				<label>Description and Details</label>
				<textarea name="description" class="autoResize"></textarea>

				<label>Client</label>
				<input id="entitySearch"/>
				<input type="hidden" name="eid" />
				<span id="entityAccount"></span>
				
				<label>Project Status</label>
				<select name="status">
					<option value="1">Active</option>
					<option value="2">Waiting on Client</option>
				</select>
				
				<label><input type="checkbox" name="hideProject" value="1" checked="checked" /> Hide project details from client.</label>
			</div>
		</form>
	</div>
	
	<div id="dialogNewTask">
		<p>
			The following form will create a new task.
		</p>
		<form class="generic">
			<input type="hidden" name="pjid" id="taskPjid" />
			<input type="hidden" name="ptskid" id="taskPtskid" />
			
			<div>
				<label>Project Name</label>
				<input id="taskProjName" disabled="disabled "/>
				
				<label>Subtask of</label>
				<input id="taskPtaskName" disabled="disabled "/>
				
				<label>Task Name</label>
				<input name="name"/>
				
				<label>Description and Details</label>
				<textarea name="description" class="autoResize"></textarea>
				
				<label>Start Date</label>
				<input type="text" id="dateStart" name="dateStart" />
				
				<label>Due Date</label>
				<input type="text" id="dateDue" name="dateDue" />
			</div>
		</form>
	</div>
	
	<div id="dialogCancelProject">
		<p>
			Are you sure that you want to cancel the project named '<span class="projectName"></span>?'
		</p>
		<form>
			<input type="hidden" name="pjid" id="cancelPjid" />
			<input type="hidden" name="status" value="0" />
		</form>
	</div>
</div>

<pre>
<?php //print_r($projects) ?>
</pre>