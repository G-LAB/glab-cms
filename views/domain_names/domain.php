<div class="mid header">
	<h4><?=$domain?></h4>
	<p>Domain <?=(element('auto_renew', $data)) ? 'auto-':''?>renews <?=date_relative(element('registry_expiredate', $data))?>.</p>
</div>
<div class="mid body">
	<table>
		<thead>
			<tr>
				<td>Domain Profile Data</td>
				<td>Value</td>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Date Registered</td>
				<td><?=date_user(element('registry_createdate', $data))?></td>
			</tr>
			<tr>
				<td>Date Modified</td>
				<td><?=date_user(element('registry_updatedate', $data))?></td>
			</tr>
			<tr>
				<td>Date of Renewal</td>
				<td><?=date_user(element('registry_expiredate', $data))?></td>
			</tr>
			<tr>
				<td>Auto-renew?</td>
				<td><?=(element('auto_renew', $data)) ? 'Enabled' : 'Disabled'?></td>
			</tr>
		</tbody>
	</table>
</div>
<div class="mid header">
	<h5>Nameservers</h5>
</div>
<div class="mid body">
	<table>
		<thead>
			<tr>
				<td>Nameserver/IP Address</td>
			</tr>
		</thead>
		<tbody>
			<?php if (element('nameserver_list', $data)) foreach (element('nameserver_list', $data) as $ns) : ?>
			<tr>
				<td><?=element('name', $ns)?><?=element('ipaddress', $ns)?></td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>
<div class="mid header">
	<h5>Registered Contacts</h5>
	<?php $contact_set = element('contact_set', $data)?>
</div>
<div class="mid body">
	<h6>Registered Owner</h6>
	<?=$this->load->view('domain_names/contact_set', element('owner', $contact_set), TRUE)?>
</div>
<div class="mid body">
	<h6>Administrator</h6>
	<?=$this->load->view('domain_names/contact_set', element('admin', $contact_set), TRUE)?>
</div>
<div class="mid body">
	<h6>Billing</h6>
	<?=$this->load->view('domain_names/contact_set', element('billing', $contact_set), TRUE)?>
</div>
<div class="mid body">
	<h6>Technical</h6>
	<?=$this->load->view('domain_names/contact_set', element('tech', $contact_set), TRUE)?>
</div>