// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

export default function searchableInput({key, statePath, tableMode = false, columns = [], perPage = 10}) {
    if (tableMode) {
        return tableInput({key, statePath, columns, perPage})
    }
    return listInput({key, statePath})
}

function listInput({key, statePath}) {
    return {
        previous_value: null,
        value: this.$wire.entangle(statePath),
        suggestions: [],
        selected_suggestion: 0,
        refresh_suggestions: function() {
            if (this.value === this.previous_value) {
                return
            }

            if (!this.value) {
                this.suggestions = []
                this.previous_value = null
                return
            }

            this.previous_value = this.value

            // noinspection JSPotentiallyInvalidUsageOfThis
            this.$wire.callSchemaComponentMethod(key, 'getSearchResultsForJs', { search: this.value })
                .then(response => {
                    this.suggestions = response
                    this.selected_suggestion = 0
                })
        },
        set: function(item) {
            if (item === undefined) {
                return
            }

            this.value = item.value
            this.suggestions = []

            // noinspection JSPotentiallyInvalidUsageOfThis
            this.$wire.callSchemaComponentMethod(key, 'reactOnItemSelectedFromJs', { item: item })
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

function tableInput({key, statePath, columns, perPage}) {
    return {
        previous_value: null,
        value: this.$wire.entangle(statePath),
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

        refresh_table: function() {
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

        loadData: function() {
            this.isLoading = true
            this.showTable = true

            // noinspection JSPotentiallyInvalidUsageOfThis
            this.$wire.callSchemaComponentMethod(key, 'getPaginatedSearchResultsForJs', {
                search: this.value,
                page: this.tableData.page,
                sortColumn: this.sortColumn,
                sortDirection: this.sortDirection,
            }).then(response => {
                this.tableData = response
                this.isLoading = false

                // Adjust selected index if out of bounds
                if (this.selectedIndex >= response.results.length) {
                    this.selectedIndex = Math.max(0, response.results.length - 1)
                }
            })
        },

        sortBy: function(column) {
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
            } else {
                this.sortColumn = column
                this.sortDirection = 'asc'
            }
            this.loadData()
        },

        nextPage: function() {
            const totalPages = Math.ceil(this.tableData.total / this.tableData.perPage)
            if (this.tableData.page < totalPages) {
                this.tableData.page++
                this.selectedIndex = 0
                this.pageInput = ''
                this.loadData()
            }
        },

        prevPage: function() {
            if (this.tableData.page > 1) {
                this.tableData.page--
                this.selectedIndex = 0
                this.pageInput = ''
                this.loadData()
            }
        },

        goToPageFromInput: function() {
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

        selectItem: function(item) {
            if (!item) return

            this.value = item.value
            this.showTable = false

            // noinspection JSPotentiallyInvalidUsageOfThis
            this.$wire.callSchemaComponentMethod(key, 'reactOnItemSelectedFromJs', { item: item })
        },

        selectCurrentOrFirst: function() {
            if (this.tableData.results.length > 0 && this.selectedIndex >= 0) {
                const item = this.tableData.results[this.selectedIndex]
                this.selectItem(item)
            }
        },

        handleAction: function(item, action) {
            // noinspection JSPotentiallyInvalidUsageOfThis
            this.$wire.callSchemaComponentMethod(key, 'reactOnRowActionFromJs', {
                item: item,
                action: action,
            })
        },

        nextIndex: function() {
            this.selectedIndex++
            if (this.selectedIndex >= this.tableData.results.length) {
                this.selectedIndex = this.tableData.results.length - 1
            }
        },

        prevIndex: function() {
            this.selectedIndex--
            if (this.selectedIndex < 0) {
                this.selectedIndex = 0
            }
        },
    }
}
