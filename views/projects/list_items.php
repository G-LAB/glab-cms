<?php $this->load->helper('date') ?>
<div class="taskEntry">
	<div id="task-<?=$tskid?>" class="taskItem lineItem ui-style">
		<span class="name"><a href="#"><?=$name?></a></span>
		<span class="dateDue<?php if(strtotime($tsDue)<time()) echo ' overdue'; elseif (strtotime($tsDue)<time()+86400) echo ' warning' ?>">
			<?php 
				if (isset($tsStart) && strtotime($tsStart) > time()) echo 'Starts '.date_relative(strtotime($tsStart),'M. j, Y').'. '; 
				elseif (isset($tsDue)) echo 'Due '.date_relative(strtotime($tsDue),'M. j, Y').'. ';
			?> &nbsp;
		</span>
		<span class="pbar"><span class="dataTskid"><?=$tskid?></span></span>
		<a href="#" class="newTask" title="Add Subtask"><span> Add New Subtask</span><span class="dataPjid"><?=$pjid?></span><span class="dataTskid"><?=$tskid?></span></a>
		<div class="clear"></div>
	</div>
	<div class="taskList">
	<?php foreach ($tasks as $id=>$task) $this->load->view('projects/list_items', $tasks[$id]) ?>
	</div>
	<script type="text/javascript">
		$(document).ready(function() {
			$('#task-<?=$tskid?> .pbar').progressbar('option', 'value', <?=round($percentUpdate*100,0)?>);
		});
	</script>
</div>