module Jekyll
  module HideCustomBibtex
    def hideCustomBibtex(input)
      keywords = @context.registers[:site].config['filtered_bibtex_keywords']
      fields = Regexp.union(keywords.map { |keyword| Regexp.escape(keyword) })
      result = []
      skipping = false
      brace_depth = 0

      input.each_line do |line|
        if !skipping && (match = line.match(/^\s*(?:#{fields})\s*=\s*(.*)$/i))
          value = match[1]
          if value.start_with?('{')
            skipping = true
            brace_depth = value.count('{') - value.count('}')
            skipping = false if brace_depth <= 0
          else
            result << line
          end
          next
        end

        if skipping
          brace_depth += line.count('{') - line.count('}')
          skipping = false if brace_depth <= 0
          next
        end

        result << line
      end

      result.join
    end
  end
end

Liquid::Template.register_filter(Jekyll::HideCustomBibtex)
