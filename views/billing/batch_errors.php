<?php foreach ($errors as $pgid=>$error_set) : ?>
<div class="mid header">
	<h4><?=element('gateName',$gateways[$pgid])?> (<?=count($error_set)?>)</h4>
</div>
<div class="mid body">
	<?php $this->load->view('billing/batch_errors_'.element('library',$gateways[$pgid]), array('errors'=>$error_set)) ?>
</div>
<?php endforeach; ?>