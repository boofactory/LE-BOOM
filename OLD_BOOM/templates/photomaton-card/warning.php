<?php if ($warning): ?>
    <div class="<?php echo $warning['type'] === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'; ?> rounded-lg p-3 flex items-start gap-3 border">
        <svg class="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <?php echo $warning['icon']; ?>
        </svg>
        <p class="text-sm"><?php echo $warning['message']; ?></p>
    </div>
<?php endif; ?>