<?php

namespace App\Filament\Resources\BookResource\Pages;

use App\Events\BookCreated;
use App\Events\BookUpdated;
use App\Filament\Resources\BookResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditBook extends EditRecord
{
    protected static string $resource = BookResource::class;

    // protected function getHeaderActions(): array
    // {
    //     return [
    //         Actions\DeleteAction::make(),
    //     ];
    // }

    public function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function afterSave(): void
    {
        BookUpdated::dispatch($this->record);
    }
}
