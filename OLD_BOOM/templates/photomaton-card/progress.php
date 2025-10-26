<div class="space-y-2">
    <div class="flex justify-between text-sm text-gray-600">
        <span>Photos restantes</span>
        <span class="font-medium"><?php echo $photomaton['remaining_prints']; ?> / 700</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
        <?php $percentage = ($photomaton['remaining_prints'] / 700) * 100; ?>
        <div class="<?php echo $progressBarColor; ?> h-2.5 rounded-full transition-all duration-300" style="width: <?php echo $percentage; ?>%"></div>
    </div>
</div>