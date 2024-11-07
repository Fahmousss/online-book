<?php

namespace App\Filament\Resources\BookResource\Pages;

use App\Events\BookCreated;
use App\Filament\Resources\BookResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateBook extends CreateRecord
{
    protected static string $resource = BookResource::class;
    protected static bool $canCreateAnother = false;
    public function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
    protected function afterCreate(): void
    {
        // Dispatch the event after book creation
        BookCreated::dispatch($this->record);
    }
}
