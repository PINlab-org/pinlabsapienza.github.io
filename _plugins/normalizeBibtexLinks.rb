module Jekyll
  module NormalizeBibtexLinks
    LINK_FIELDS = %i[
      url doi html pdf supp blog code poster slides website latex_src video
    ].freeze

    def bibliography
      parsed_bibliography = super
      parsed_bibliography.each do |entry|
        normalize_bibtex_links(entry) if entry.is_a?(BibTeX::Entry)
      end
      parsed_bibliography
    end

    def details_path_for(entry)
      normalize_bibtex_links(entry)
      super
    end

    private

    def normalize_bibtex_links(entry)
      LINK_FIELDS.each do |field|
        next unless entry.has_field?(field)

        entry[field] = entry[field].to_s.gsub(/\s+/, '')
      end
    end
  end
end

Jekyll::Scholar::Utilities.prepend(Jekyll::NormalizeBibtexLinks)
