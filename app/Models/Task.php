<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
   protected $fillable = [
    'title',
    'description',
    'is_completed',
    'due_date',
    'project_id',
   ];

   public function project(): BelongsTo
   {
    return $this->belongsTo(Project::class, 'project_id');
   }
}
