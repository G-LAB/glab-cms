<div class="mid header">
<h3><?=element('name',$data)?></h3>
<div class="floatr">
<a href="<?=site_url('agreements/revisions/'.element('agid',$data))?>" class="button">&lt; Back to Revisions</a>
</div>
<strong>Revised:</strong> <del datetime="<?=standard_date('DATE_W3C',strtotime(element('tsCreated',$data)))?>"><?=date_user(strtotime(element('tsCreated',$data)))?></del><br/>
<strong>Effective:</strong> <del datetime="<?=standard_date('DATE_W3C',strtotime(element('tsEffective',$data)))?>"><?=date_user(strtotime(element('tsEffective',$data)))?></del>
</div>
<div class="mid body">
<?=element('text',$data)?>
</div>