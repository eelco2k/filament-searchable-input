// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

export default function searchableInput({key, statePath, tableMode = false, columns = [], perPage = 10, wire, initialValue, displayValueKey = 'value'}) {
    if (tableMode) {
        return tableInput({key, statePath, columns, perPage, wire, displayValueKey})
    }
    return listInput({key, statePath, wire, displayValueKey})
}

/**
 * Extract a string value from a potentially complex value
 */
function extractStringValue(value, displayValueKey = 'value') {
    if (value === null || value === undefined) {
        return ''
    }
    if (typeof value === 'string') {
        return value
    }
    if (typeof value === 'number') {
        return String(value)
    }
    if (typeof value === 'object') {
        if (value[displayValueKey] !== undefined) {
            return String(value[displayValueKey])
        }
        if (value.value !== undefined) {
            return String(value.value)
        }
        if (value.label !== undefined) {
            return String(value.label)
        }
    }
    return ''
}

function listInput({key, statePath, wire, displayValueKey}) {
    return {
        previous_value: null,
        suggestions: [],
        selected_suggestion: 0,

        // Use entanglement for proper Livewire sync
        init() {
            // Create entangled binding
            this._entangled = wire.entangle(statePath)

            // Set initial display value from entangled state
            const initialValue = extractStringValue(this._entangled, displayValueKey)
            this.value = initialValue
            this.previous_value = initialValue

            // Watch for external changes to the entangled value
            this.$watch('_entangled', (newValue) => {
                this.value = extractStringValue(newValue, displayValueKey)
            })
        },

        get value() {
            return this._displayValue ?? ''
        },

        set value(val) {
            this._displayValue = val
        },

        refresh_suggestions() {
            if (this.value === this.previous_value) {
                return
            }

            if (!this.value) {
                this.suggestions = []
                this.previous_value = null
                return
            }

            this.previous_value = this.value

            wire.callSchemaComponentMethod(key, 'getSearchResultsForJs', { search: this.value })
                .then(response => {
                    this.suggestions = response
                    this.selected_suggestion = 0
                })
        },

        set(item) {
            if (item === undefined) {
                return
            }

            const stringValue = extractStringValue(item, displayValueKey)
            this.value = stringValue
            this._entangled = stringValue  // Sync to Livewire
            this.suggestions = []

            wire.callSchemaComponentMethod(key, 'reactOnItemSelectedFromJs', { item: item })
        },

        previous_suggestion() {
            this.selected_suggestion--

            if (this.selected_suggestion < 0) {
                this.selected_suggestion = 0
            }
        },

        next_suggestion() {
            this.selected_suggestion++

            if (this.selected_suggestion > this.suggestions.length - 1) {
                this.selected_suggestion = this.suggestions.length - 1
            }
        },
    }
}

function tableInput({key, statePath, columns, perPage, wire, displayValueKey}) {
    return {
        previous_value: null,
        showTable: false,
        tableData: {
            results: [],
            total: 0,
            perPage: perPage,
            page: 1,
        },
        selectedIndex: 0,
        sortColumn: null,
        sortDirection: 'asc',
        pageInput: '',
        isLoading: false,

        // Use entanglement for proper Livewire sync
        init() {
            // Create entangled binding
            this._entangled = wire.entangle(statePath)

            // Set initial display value from entangled state
            const initialValue = extractStringValue(this._entangled, displayValueKey)
            this.value = initialValue
            this.previous_value = initialValue

            // Watch for external changes to the entangled value
            this.$watch('_entangled', (newValue) => {
                this.value = extractStringValue(newValue, displayValueKey)
            })
        },

        get value() {
            return this._displayValue ?? ''
        },

        set value(val) {
            this._displayValue = val
        },

        refresh_table() {
            if (this.value === this.previous_value) {
                return
            }

            if (!this.value) {
                this.tableData = { results: [], total: 0, perPage: perPage, page: 1 }
                this.showTable = false
                this.previous_value = null
                return
            }

            this.previous_value = this.value
            this.tableData.page = 1
            this.selectedIndex = 0
            this.pageInput = ''
            this.loadData()
        },

        loadData() {
            this.isLoading = true
            this.showTable = true

            wire.callSchemaComponentMethod(key, 'getPaginatedSearchResultsForJs', {
                search: this.value,
                page: this.tableData.page,
                sortColumn: this.sortColumn,
                sortDirection: this.sortDirection,
            }).then(response => {
                this.tableData = response
                this.isLoading = false

                if (this.selectedIndex >= response.results.length) {
                    this.selectedIndex = Math.max(0, response.results.length - 1)
                }
            })
        },

        sortBy(column) {
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
            } else {
                this.sortColumn = column
                this.sortDirection = 'asc'
            }
            this.loadData()
        },

        nextPage() {
            const totalPages = Math.ceil(this.tableData.total / this.tableData.perPage)
            if (this.tableData.page < totalPages) {
                this.tableData.page++
                this.selectedIndex = 0
                this.pageInput = ''
                this.loadData()
            }
        },

        prevPage() {
            if (this.tableData.page > 1) {
                this.tableData.page--
                this.selectedIndex = 0
                this.pageInput = ''
                this.loadData()
            }
        },

        goToPageFromInput() {
            const pageNum = parseInt(this.pageInput)
            if (!pageNum || isNaN(pageNum)) {
                this.pageInput = ''
                return
            }

            const totalPages = Math.ceil(this.tableData.total / this.tableData.perPage)
            const targetPage = Math.max(1, Math.min(pageNum, totalPages))

            this.tableData.page = targetPage
            this.selectedIndex = 0
            this.pageInput = ''
            this.loadData()
        },

        selectItem(item) {
            if (!item) return

            const stringValue = extractStringValue(item, displayValueKey)
            this.value = stringValue
            this._entangled = stringValue  // Sync to Livewire
            this.showTable = false

            wire.callSchemaComponentMethod(key, 'reactOnItemSelectedFromJs', { item: item })
        },

        selectCurrentOrFirst() {
            if (this.tableData.results.length > 0 && this.selectedIndex >= 0) {
                const item = this.tableData.results[this.selectedIndex]
                this.selectItem(item)
            }
        },

        handleAction(item, action) {
            wire.callSchemaComponentMethod(key, 'reactOnRowActionFromJs', {
                item: item,
                action: action,
            })
        },

        nextIndex() {
            this.selectedIndex++
            if (this.selectedIndex >= this.tableData.results.length) {
                this.selectedIndex = this.tableData.results.length - 1
            }
        },

        prevIndex() {
            this.selectedIndex--
            if (this.selectedIndex < 0) {
                this.selectedIndex = 0
            }
        },
    }
}
