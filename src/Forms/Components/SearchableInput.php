<?php

/** @noinspection PhpUnused */

namespace DefStudio\SearchableInput\Forms\Components;

use Closure;
use DefStudio\SearchableInput\DTO\SearchableColumn;
use DefStudio\SearchableInput\DTO\SearchResult;
use Filament\Forms\Components\TextInput;
use Filament\Support\Components\Attributes\ExposedLivewireMethod;
use Livewire\Attributes\Renderless;

class SearchableInput extends TextInput
{
    /** @var ?Closure(string): ?array<int|string, string|SearchResult> */
    protected ?Closure $searchUsing = null;

    /** @var ?Closure(SearchResult): void */
    protected ?Closure $onItemSelected = null;

    protected bool $optionsIsList = false;

    /** @var array<array-key, string>|Closure(): ?array<array-key, string>|null */
    protected array | Closure | null $options = null;

    /** @var array<SearchableColumn>|Closure(): ?array<SearchableColumn> */
    protected array | Closure | null $columns = null;

    protected int | Closure $maxResultsPerPage = 10;

    protected int | Closure $maxResults = 100;

    /** @var ?Closure(int, string, string, string): array<SearchResult> */
    protected ?Closure $paginatedSearchUsing = null;

    /** @var ?Closure(SearchResult): void */
    protected ?Closure $onRowAction = null;

    protected array $actions = [];

    protected string | Closure | null $sortColumn = null;
    protected string $sortDirection = 'asc';

    protected ?int $currentPage = 1;

    protected function setUp(): void
    {
        $this->fieldWrapperView('searchable-input-wrapper');

        $this->extraInputAttributes(['x-model' => 'value']);
    }

    #[ExposedLivewireMethod]
    #[Renderless]
    public function getSearchResultsForJs(string $search): array
    {
        if ($this->isDisabled() || $this->isReadOnly()) {
            return [];
        }

        // If table layout is enabled, use paginated search instead
        if ($this->hasTableLayout()) {
            return $this->getPaginatedSearchResults($search, 1);
        }

        $results = $this->evaluate($this->searchUsing, [
            'search' => $search,
            'options' => $this->getOptions(),
        ]);

        $results ??= collect($this->getOptions())
            ->filter(fn (string $option) => str($option)->contains($search, true))
            ->toArray();

        if ($this->optionsIsList) {
            $results = collect($results)
                ->map(fn ($item) => $item instanceof SearchResult ? $item : SearchResult::make($item))
                ->toArray();
        } else {
            $results = collect($results)
                ->map(fn ($item, $key) => $item instanceof SearchResult ? $item : SearchResult::make($key, $item))
                ->toArray();
        }

        return array_values($results);
    }

    #[ExposedLivewireMethod]
    #[Renderless]
    public function getPaginatedSearchResultsForJs(string $search, int $page, ?string $sortColumn = null, ?string $sortDirection = null): array
    {
        if ($this->isDisabled() || $this->isReadOnly()) {
            return [
                'results' => [],
                'total' => 0,
                'perPage' => $this->getMaxResultsPerPage(),
                'page' => $page,
            ];
        }

        return $this->getPaginatedSearchResults($search, $page, $sortColumn, $sortDirection);
    }

    private function getPaginatedSearchResults(string $search, int $page, ?string $sortColumn = null, ?string $sortDirection = null): array
    {
        $perPage = $this->getMaxResultsPerPage();
        $maxResults = $this->getMaxResults();

        $results = $this->evaluate($this->paginatedSearchUsing, [
            'search' => $search,
            'page' => $page,
            'perPage' => $perPage,
            'sortColumn' => $sortColumn,
            'sortDirection' => $sortDirection,
        ]);

        // If no paginated search is provided, fall back to regular search and slice
        if ($results === null) {
            $allResults = $this->evaluate($this->searchUsing, [
                'search' => $search,
                'options' => $this->getOptions(),
            ]) ?? [];

            // Convert to SearchResult objects if needed
            $allResults = collect($allResults)
                ->map(fn ($item, $key) => $item instanceof SearchResult ? $item : SearchResult::make($key, $item))
                ->take($maxResults)
                ->toArray();

            $total = count($allResults);
            $results = array_slice($allResults, ($page - 1) * $perPage, $perPage);
        } else {
            $total = count($results); // Assume paginatedSearchUsing already returns paginated subset
        }

        return [
            'results' => array_values($results),
            'total' => $total,
            'perPage' => $perPage,
            'page' => $page,
        ];
    }

    #[ExposedLivewireMethod]
    public function reactOnItemSelectedFromJs(array $item): void
    {
        $this->evaluate($this->onItemSelected, [
            'item' => SearchResult::fromArray($item),
        ]);
    }

    #[ExposedLivewireMethod]
    public function reactOnRowActionFromJs(array $item, string $action = 'select'): void
    {
        if ($action === 'select') {
            $this->evaluate($this->onItemSelected, [
                'item' => SearchResult::fromArray($item),
            ]);
        } else {
            $this->evaluate($this->onRowAction, [
                'item' => SearchResult::fromArray($item),
                'action' => $action,
            ]);
        }
    }

    /**
     * @return array<array-key, string>
     */
    public function getOptions(): array
    {
        $options = $this->evaluate($this->options) ?? [];

        if (array_is_list($options)) {
            $this->optionsIsList = true;
        }

        return $options;
    }

    /**
     * @param  array<array-key, string>|Closure(): array<array-key, string>|null  $options
     */
    public function options(array | Closure | null $options): static
    {
        $this->options = $options;

        return $this;
    }

    /**
     * @param  ?Closure(string): ?array<int|string, string|SearchResult>  $searchUsing
     */
    public function searchUsing(?Closure $searchUsing): static
    {
        $this->searchUsing = $searchUsing;

        return $this;
    }

    /**
     * @param  ?Closure(SearchResult $item): void  $callback
     */
    public function onItemSelected(?Closure $callback): static
    {
        $this->onItemSelected = $callback;

        return $this;
    }

    /**
     * @param  array<SearchableColumn>|Closure(): ?array<SearchableColumn>  $columns
     */
    public function columns(array | Closure | null $columns): static
    {
        $this->columns = $columns;

        return $this;
    }

    /**
     * @return array<SearchableColumn>
     */
    public function getColumns(): array
    {
        return $this->evaluate($this->columns) ?? [];
    }

    public function hasTableLayout(): bool
    {
        return !empty($this->getColumns());
    }

    public function getMaxResultsPerPage(): int
    {
        return $this->evaluate($this->maxResultsPerPage) ?? 10;
    }

    public function maxResultsPerPage(int | Closure $maxResultsPerPage): static
    {
        $this->maxResultsPerPage = $maxResultsPerPage;
        return $this;
    }

    public function getMaxResults(): int
    {
        return $this->evaluate($this->maxResults) ?? 100;
    }

    public function maxResults(int | Closure $maxResults): static
    {
        $this->maxResults = $maxResults;
        return $this;
    }

    /**
     * @param  ?Closure(int $page, string $search, ?string $sortColumn, ?string $sortDirection): ?array<SearchResult>  $callback
     */
    public function paginatedSearchUsing(?Closure $callback): static
    {
        $this->paginatedSearchUsing = $callback;
        return $this;
    }

    /**
     * @param  ?Closure(SearchResult $item, string $action): void  $callback
     */
    public function onRowAction(?Closure $callback): static
    {
        $this->onRowAction = $callback;
        return $this;
    }

    public function getActionDefinitions(): array
    {
        return $this->actions ?? [];
    }

    public function tableAction(string $name, string $label): static
    {
        $this->actions[$name] = [
            'label' => $label,
            'name' => $name,
        ];
        return $this;
    }

    public function isSearchEnabled(): bool
    {
        return $this->searchUsing !== null || $this->getOptions() !== [];
    }

    public function getLabelColumnKey(): ?string
    {
        foreach ($this->getColumns() as $column) {
            if ($column->isDisplayLabel()) {
                return $column->key();
            }
        }

        // Default to first column if no explicit label column set
        return $this->getColumns()[0]?->key() ?? null;
    }
}
