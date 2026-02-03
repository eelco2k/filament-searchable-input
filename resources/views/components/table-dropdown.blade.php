@php
    $columns = $field->getTableColumns();
    $actions = $field->getActionDefinitions();
@endphp

<!-- Table Dropdown -->
<div x-show="showTable && tableData && tableData.results && tableData.results.length > 0"
     x-cloak
     class="def-fo-searchable-input-dropdown
            z-10 absolute top-full mt-2 start-0
            overflow-hidden
            rounded-lg bg-white dark:bg-gray-900
            shadow-lg ring-1 ring-gray-950/5 dark:ring-white/10
            will-change-[visibility]
            text-sm"
>
    <div class="def-fo-searchable-input-dropdown-wrapper max-h-[24rem] overflow-y-auto">
        <!-- Table -->
        <table class="min-w-full align-middle text-sm whitespace-nowrap">
            <!-- Table Header -->
            <thead>
                <tr class="border-b-2 border-zinc-100 dark:border-zinc-700/50">
                    @foreach($columns as $column)
                        <th class="group px-3 py-2 font-semibold text-zinc-900 dark:text-zinc-50 {{ $column->getWidth() ?? '' }}
                            @if($column->getAlignment() === 'center') text-center
                            @elseif($column->getAlignment() === 'right') text-end
                            @else text-start
                            @endif">
                            <div class="inline-flex items-center gap-2">
                                <span>{{ $column->getLabel() }}</span>
                                @if($column->isSortable())
                                    <button
                                        @click.prevent.stop="sortBy('{{ $column->key() }}')"
                                        type="button"
                                        class="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-1.5 py-1 text-sm leading-5 font-semibold text-zinc-800 transition hover:border-zinc-300 hover:text-zinc-900 hover:shadow-xs focus:ring-3 focus:ring-zinc-300/25 active:border-zinc-200 active:shadow-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-200 dark:focus:ring-zinc-600/40 dark:active:border-zinc-700"
                                        x-bind:class="{ 'opacity-25 group-hover:opacity-100': sortColumn !== '{{ $column->key() }}' }"
                                    >
                                        <!-- Default sort icon -->
                                        <template x-if="sortColumn !== '{{ $column->key() }}'">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="hi-micro hi-arrows-up-down inline-block size-4">
                                                <path fill-rule="evenodd" d="M13.78 10.47a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l.97.97V5.75a.75.75 0 0 1 1.5 0v5.69l.97-.97a.75.75 0 0 1 1.06 0ZM2.22 5.53a.75.75 0 0 1 0-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1-1.06 1.06l-.97-.97v5.69a.75.75 0 0 1-1.5 0V4.56l-.97.97a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd"/>
                                            </svg>
                                        </template>
                                        <!-- Descending sort icon -->
                                        <template x-if="sortColumn === '{{ $column->key() }}' && sortDirection === 'desc'">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="hi-micro hi-arrow-long-down inline-block size-4">
                                                <path fill-rule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z" clip-rule="evenodd"/>
                                            </svg>
                                        </template>
                                        <!-- Ascending sort icon -->
                                        <template x-if="sortColumn === '{{ $column->key() }}' && sortDirection === 'asc'">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="hi-micro hi-arrow-long-up inline-block size-4">
                                                <path fill-rule="evenodd" d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z" clip-rule="evenodd"/>
                                            </svg>
                                        </template>
                                    </button>
                                @endif
                            </div>
                        </th>
                    @endforeach

                    {{-- Actions Column --}}
                    @if(!empty($actions))
                        <th class="group px-3 py-2 text-center font-semibold text-zinc-900 dark:text-zinc-50">
                            <span>{{ __('Actions') }}</span>
                        </th>
                    @endif
                </tr>
            </thead>

            <!-- Table Body -->
            <tbody>
                <template x-for="(suggestion, index) in tableData.results" :key="suggestion.value">
                    <tr class="border-t border-zinc-100 even:bg-gray-50 dark:border-zinc-700/50 dark:even:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        x-bind:class="{ 'bg-gray-100 dark:bg-gray-700': selectedIndex === index }"
                        @click.prevent.stop="selectItem(suggestion)">

                        @foreach($columns as $column)
                            <td class="px-3 py-2
                                @if($column->getAlignment() === 'center') text-center
                                @elseif($column->getAlignment() === 'right') text-end
                                @else text-start
                                @endif
                                {{ $column->getWidth() ?? '' }}
                                @if($column->key() === ($field->getLabelColumnKey() ?? '')) font-medium text-gray-950 dark:text-white
                                @else text-gray-600 dark:text-gray-400
                                @endif">
                                <span x-text="suggestion.data?.{{ $column->key() }} ?? suggestion.{{ $column->key() }} ?? ''"></span>
                            </td>
                        @endforeach

                        {{-- Actions --}}
                        @if(!empty($actions))
                            <td class="px-3 py-2 text-center">
                                <div class="flex items-center justify-center gap-1">
                                    @foreach($actions as $actionName => $action)
                                        <button
                                            type="button"
                                            @click.prevent.stop="handleAction(suggestion, '{{ $actionName }}')"
                                            class="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs leading-5 font-semibold text-zinc-800 hover:border-zinc-300 hover:text-zinc-900 hover:shadow-xs focus:ring-3 focus:ring-zinc-300/25 active:border-zinc-200 active:shadow-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-200 dark:focus:ring-zinc-600/40 dark:active:border-zinc-700">
                                            {{ $action['label'] }}
                                        </button>
                                    @endforeach
                                </div>
                            </td>
                        @endif
                    </tr>
                </template>
            </tbody>
        </table>

        {{-- Empty State --}}
        <div x-show="tableData && tableData.results && tableData.results.length === 0 && value && value.length > 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
            {{ __('No results found.') }}
        </div>
    </div>

    {{-- Pagination Footer --}}
    <div x-show="tableData && tableData.total > 0" class="border-t border-zinc-100 dark:border-zinc-700/50 px-3 py-2">
        <div class="flex items-center justify-between">
            {{-- Results count --}}
            <span class="text-xs text-zinc-500 dark:text-zinc-400">
                <span x-text="((tableData.page - 1) * tableData.perPage + 1)"></span>
                -
                <span x-text="Math.min(tableData.page * tableData.perPage, tableData.total)"></span>
                of
                <span x-text="tableData.total"></span>
            </span>

            {{-- Pagination controls --}}
            <div class="flex items-center gap-2">
                {{-- Previous button --}}
                <button
                    @click.prevent.stop="prevPage()"
                    :disabled="tableData.page <= 1"
                    type="button"
                    class="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/>
                    </svg>
                </button>

                {{-- Page input --}}
                <div class="flex items-center gap-1.5 text-xs">
                    <span class="text-zinc-500 dark:text-zinc-400">Page</span>
                    <input
                        type="text"
                        x-model="pageInput"
                        @keydown.enter.prevent.stop="goToPageFromInput()"
                        class="w-12 px-1 py-0.5 text-center border border-zinc-200 rounded text-zinc-900 bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        :placeholder="tableData.page">
                    <span class="text-zinc-500 dark:text-zinc-400">of <span x-text="Math.ceil(tableData.total / tableData.perPage)"></span></span>
                </div>

                {{-- Next button --}}
                <button
                    @click.prevent.stop="nextPage()"
                    :disabled="tableData.page >= Math.ceil(tableData.total / tableData.perPage)"
                    type="button"
                    class="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>
