THESIS_DIR := vorlage-abschlussarbeiten-tex
THESIS_TEX := $(THESIS_DIR)/thesis.tex
SLIDEV_DIR := slidev

.PHONY: all thesis slidev data clean

all: thesis slidev

thesis:
	cd $(THESIS_DIR) && latexmk -pdf -interaction=nonstopmode thesis.tex

slidev:
	cd $(SLIDEV_DIR) && npm install && npx slidev build slides.md

data:
	python3 automation/summarize_studies.py
	python3 automation/render_tables.py
	python3 automation/plot_summary.py
	python3 automation/prisma_flow.py

clean:
	cd $(THESIS_DIR) && latexmk -C
