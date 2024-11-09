<?php

namespace App\Filament\Resources;

use App\Events\BookCreated;
use App\Events\BookUpdated;
use App\Filament\Resources\BookResource\Pages;
use App\Filament\Resources\BookResource\RelationManagers;
use App\Models\Book;
use Filament\Forms;
use Filament\Forms\Components\Card;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Support\Enums\Alignment;
use Filament\Support\View\Components\Modal;
use Filament\Tables;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Str;


class BookResource extends Resource
{
    protected static ?string $model = Book::class;

    protected static ?string $navigationIcon = 'heroicon-o-book-open';
    protected static ?string $navigationGroup = 'Books';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Grid::make(2)
                    ->schema([
                        Grid::make(12)->schema([  // Two-column layout for basic details
                            Section::make('Upload Image')
                                ->description('Image can be book`s cover')
                                ->schema([
                                    FileUpload::make('images')
                                        ->image()
                                        ->hiddenLabel()
                                        ->imageEditor()

                                ])->columnSpan(7),
                            Section::make('Book Details')
                                ->description('Enter basic information about the book')
                                ->schema([
                                    Grid::make(2)->schema([
                                        TextInput::make('title')
                                            ->label('Book Title')
                                            ->required()
                                            ->maxLength(255)
                                            ->live()
                                            ->afterStateUpdated(fn(Set $set, ?string $state) => $set('slug', Str::slug($state))),
                                        TextInput::make('slug')
                                            ->readOnly(),
                                    ]),
                                    Select::make('author_id')
                                        ->label('Author')
                                        ->relationship('author', 'name')
                                        ->required()
                                        ->searchable(),
                                    Select::make('categories')
                                        ->label('Categories')
                                        ->relationship('categories', 'name')
                                        ->required()
                                        ->multiple()
                                        ->preload()
                                        ->searchable(),
                                ])->columnSpan(5),
                        ]),
                    ]),
                Section::make('Pricing & Stock')
                    ->description('Manage price and stock information')
                    ->schema([

                        Grid::make(2)->schema([
                            TextInput::make('price')
                                ->numeric()
                                ->label('Price')
                                ->prefix('$')
                                ->required()
                                ->minValue(0),
                            TextInput::make('stock')
                                ->numeric()
                                ->label('Stock')
                                ->required()
                                ->minValue(0)
                                ->step(1),
                        ]),
                    ])
                    ->collapsible()
                    ->collapsed(),

                Section::make('Additional Information')
                    ->description('Optional information about the book')
                    ->schema([
                        Textarea::make('description')
                            ->label('Description')
                            ->rows(5)
                            ->maxLength(500),
                        DatePicker::make('published_date')
                            ->label('Published Date')
                            ->required(),
                        Toggle::make('is_featured')
                            ->label('Featured Book')
                            ->default(false),
                    ])
                    ->collapsible(),
            ]);
    }


    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\Layout\Stack::make([
                    ImageColumn::make('images')
                        ->height(200)
                        ->extraImgAttributes([
                            'class' => 'object-cover w-full h-[200px] rounded-xl',
                        ]),

                    Tables\Columns\Layout\Stack::make([
                        Tables\Columns\TextColumn::make('title')
                            ->searchable()
                            ->weight('bold')
                            ->size('md'),

                        Split::make([
                            Tables\Columns\TextColumn::make('author.name')
                                ->size('xs')
                                ->grow(),
                            Tables\Columns\TextColumn::make('published_date')
                                ->date()
                                ->sinceTooltip()
                                ->sortable()
                                ->size('xs')
                                ->alignEnd()

                        ]),
                        Tables\Columns\TextColumn::make('categories.name')
                            ->badge()
                            ->color('success')
                            ->separator(',')
                            ->size('xs'),
                        Tables\Columns\TextColumn::make('description')
                            ->size('sm')
                            ->lineClamp(3),
                        Tables\Columns\TextColumn::make('deleted_at')
                            ->dateTime()
                            ->sortable()
                            ->color('danger')
                            ->size('xs')
                            ->placeholder('Not deleted')
                    ])
                        ->space(2)
                        ->extraAttributes([
                            'class' => 'py-4'
                        ]),
                ]),
            ])
            ->defaultSort('published_date', 'desc')
            ->contentGrid([
                'md' => 2,
                'xl' => 3,
                '2xl' => 5,
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->after(fn(Book $record) => BookUpdated::dispatch($record)),
                Tables\Actions\ForceDeleteAction::make(),
                Tables\Actions\RestoreAction::make()
                    ->after(fn(Book $record) => BookUpdated::dispatch($record)),
            ]);
        // ->bulkActions([
        //     Tables\Actions\BulkActionGroup::make([
        //         Tables\Actions\DeleteBulkAction::make(),
        //         Tables\Actions\ForceDeleteBulkAction::make(),
        //         Tables\Actions\RestoreBulkAction::make(),
        //     ]),
        // ]);
    }
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBooks::route('/'),
            'create' => Pages\CreateBook::route('/create'),
            'edit' => Pages\EditBook::route('/{record}/edit'),
        ];
    }
}
