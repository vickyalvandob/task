<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Project extends Model
{
    protected $table = 'projects';

    protected $fillable = [
        'title',
        'description',
        'user_id',
       ];
    
       public function tasks(): HasMany
       {
        return $this->hasMany(Task::class);
       }

       public function user(): BelongsTo
       {
        return $this->belongsTo(User::class);
       }
}
