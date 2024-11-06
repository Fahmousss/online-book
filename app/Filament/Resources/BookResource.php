<?php

namespace App\Filament\Resources;

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
use Filament\Tables;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
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
                                    Select::make('category_id')
                                        ->label('Category')
                                        ->relationship('category', 'name')
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
            // ->columns([
            //     ImageColumn::make('images')->grow(false),
            //     TextColumn::make('title')
            //         ->label('Title')
            //         ->searchable()  // Allow searching by title
            //         ->sortable(),   // Enable sorting by title


            //     TextColumn::make('description'),
            //     TextColumn::make('author.name')
            //         ->label('Author')
            //         ->sortable()
            //         ->searchable(),

            //     TextColumn::make('category.name')
            //         ->label('Category')
            //         ->sortable()
            //         ->searchable(),

            //     TextColumn::make('price')
            //         ->label('Price')
            //         ->money('') // Format as currency
            //         ->sortable(),

            //     TextColumn::make('stock')
            //         ->label('Stock')
            //         ->sortable()
            //         ->numeric(),

            //     ToggleColumn::make('is_featured')
            //         ->label('Featured'),

            //     TextColumn::make('published_date')
            //         ->label('Published Date')
            //         ->date('F j, Y') // Format date as "Month Day, Year"
            //         ->sortable(),


            // ])
            ->columns([
                Tables\Columns\Layout\Split::make([
                    Tables\Columns\Layout\Grid::make()
                        ->schema([
                            Tables\Columns\Layout\Grid::make()
                                ->schema([
                                    ImageColumn::make('images')
                                        ->height('200px')
                                        ->extraAttributes([
                                            'style' => app()->getLocale() == 'ar' ? 'margin:-12px -16px 0px -40px w-full' : 'margin:-12px -40px 0px -16px w-full',
                                        ])
                                        ->extraImgAttributes([
                                            'class' => 'object-cover h-fit rounded-xl w-full',
                                        ]),
                                ])
                                ->columns(1),

                            Tables\Columns\Layout\Grid::make()
                                ->schema([
                                    Tables\Columns\TextColumn::make('title')
                                        ->searchable()
                                        ->extraAttributes([
                                            'class' => 'text-gray-500 dark:text-gray-300 font-bold text-xs'
                                        ])
                                        ->columnSpan(2),

                                    Tables\Columns\TextColumn::make('published_date')
                                        ->sinceTooltip()
                                        ->sortable()
                                        ->extraAttributes([
                                            'class' => 'text-gray-500 dark:text-gray-300 text-xs'
                                        ])
                                        ->alignEnd(),
                                ])
                                ->extraAttributes([
                                    'class' => 'mt-2 -mr-6 rtl:-ml-6 rtl:mr-0'
                                ])
                                ->columns(3),

                            Tables\Columns\Layout\Grid::make()
                                ->schema([
                                    Tables\Columns\TextColumn::make('author.name')
                                        ->extraAttributes([
                                            'class' => 'text-gray-500 dark:text-gray-300 text-xs'
                                        ])
                                        ->alignEnd(),
                                ])
                                ->extraAttributes([
                                    'class' => '-mr-6 rtl:-ml-6 rtl:mr-0'
                                ])
                                ->columns(1),

                            Tables\Columns\Layout\Grid::make()
                                ->schema([
                                    Tables\Columns\TextColumn::make('description')
                                        ->extraAttributes([
                                            'class' => 'text-gray-700 dark:text-gray-300 text-xs'
                                        ])
                                        ->alignJustify(),
                                ])
                                ->columns(1)
                                ->extraAttributes([
                                    'class' => 'mb-3 -mr-6 rtl:-ml-6 rtl:mr-0'
                                ]),
                        ])
                        ->columns(1),
                ]),
            ])
            ->defaultSort('published_date', 'desc')
            ->contentGrid([
                'md' => 2,
                'xl' => 4,
                '2xl' => 5,
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                ]),
            ]);
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
