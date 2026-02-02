<?php

namespace DefStudio\SearchableInput\DTO;

use Closure;

class SearchableColumn
{
    protected string $label;
    protected bool $sortable = false;
    protected ?string $alignment = 'left'; // left, center, right
    protected ?string $width = null;
    protected bool $isLabel = false; // marks this column as the display label
    protected ?Closure $formatUsing = null;

    final public function __construct(protected string $key) {}

    public static function make(string $key): self
    {
        return new static($key);
    }

    public function label(string $label): self
    {
        $this->label = $label;
        return $this;
    }

    public function sortable(bool $sortable = true): self
    {
        $this->sortable = $sortable;
        return $this;
    }

    public function alignment(string $alignment): self
    {
        $this->alignment = $alignment;
        return $this;
    }

    public function width(?string $width): self
    {
        $this->width = $width;
        return $this;
    }

    public function isLabel(bool $isLabel = true): self
    {
        $this->isLabel = $isLabel;
        return $this;
    }

    public function formatUsing(?Closure $callback): self
    {
        $this->formatUsing = $callback;
        return $this;
    }

    public function key(): string
    {
        return $this->key;
    }

    public function getLabel(): string
    {
        return $this->label ?? $this->key;
    }

    public function isSortable(): bool
    {
        return $this->sortable;
    }

    public function getAlignment(): string
    {
        return $this->alignment ?? 'left';
    }

    public function getWidth(): ?string
    {
        return $this->width;
    }

    public function isDisplayLabel(): bool
    {
        return $this->isLabel;
    }

    public function format(mixed $value, array $data): mixed
    {
        if ($this->formatUsing === null) {
            return $value;
        }

        return ($this->formatUsing)($value, $data);
    }

    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->getLabel(),
            'sortable' => $this->sortable,
            'alignment' => $this->getAlignment(),
            'width' => $this->getWidth(),
            'isLabel' => $this->isLabel,
        ];
    }
}
