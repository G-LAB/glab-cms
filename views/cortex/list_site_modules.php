<div class="mid body">
	<table>
		<thead>
			<tr>
				<td>Page Title</td>
				<td>Route</td>
				<td>Module Type</td>
				<td>Actions</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($data as $module) : ?>
			<tr>
				<td><?=element('title',$module)?></td>
				<td><?=element('route',$module)?></td>
				<td><?=element('module',$module)?></td>
				<td>
					<a href="#" class="button red">Delete</a>
					<?php if (element('module',$module) == 'page') : ?><a href="<?=site_url('products/cortex/module/'.element('module',$module).'/'.element('mcid',$module))?>" class="button">Edit Content</a><?php endif; ?>
				</td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>