<div class="mid body">
	<form action="<?=current_url()?>" method="get">
		<div>
			<label for="orderStatus">Filter by Order Status</label>
			<a href="<?=site_url('billing/new_order')?>" class="button floatr green">New Order</a>
			<?=form_dropdown('status',$this->data->orderStatus(),$status,'id="orderStatus"')?>
			<button action="submit" name="action" value="filter">Filter Results</button>
		</div>
	</form>
	<table>
		<thead>
			<tr>
				<td>Order ID</td>
				<td>Account</td>
				<td>Date Ordered</td>
				<td>Order Status</td>
				<td class="justr">Actions</td>
			</tr>
		</thead>
		<tbody>
	<?php foreach ($orders as $order) : ?>
			<tr>
				<td><a href="<?=site_url('billing/order/'.element('orid',$order))?>"><strong><?=element('orid',$order)?></strong></a></td>
				<td><?=profile_link(element('eid',$order))?></td>
				<td><?=date_user(strtotime(element('tsCreated',$order)))?></td>
				<td class="status <?=element('status',$order)?>"><?=humanize(element('status',$order))?></td>
				<td class="justr">
					<a href="<?=site_url('billing/order/'.element('orid',$order))?>" class="button">View Order</a>
				</td>
			</tr>
	<?php endforeach; ?>
	<?php if (!isset($order)) : ?>
			<tr>
				<td colspan="8">No orders found.</td>
			</tr>
	<?php endif; ?>
		</tbody>
	</table>
</div>