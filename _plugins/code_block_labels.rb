# Labels highlighted code blocks with their language, for the header strip styled in
# _sass/_broadsheet.scss. Adds data-lang="<name>" to every block Rouge highlights, both
# Markdown fences and {% highlight %} tags, using Rouge's own name for the language.

require "cgi"
require "rouge"

module CodeBlockLabels
  # Rouge titles that read oddly in a label.
  RENAMES = { "shell" => "Shell", "diff" => "Diff", "Irb" => "IRB" }.freeze
  # Languages that get no label.
  UNLABELLED = ["Plain Text"].freeze

  # Kramdown may put attributes from {: ... } before the class, so allow any attributes first.
  FENCE = /<div((?: [\w:-]+="[^"]*")*) class="language-([^\s"]+)([^"]*?)highlighter-rouge"/
  TAG = /<figure class="highlight"><pre><code class="language-([^\s"]+)" data-lang="([^"]*)">/

  def self.label(lang)
    lexer = Rouge::Lexer.find(lang)
    title = lexer ? lexer.title : lang
    title = RENAMES.fetch(title, title)
    UNLABELLED.include?(title) ? "" : CGI.escapeHTML(title)
  end

  def self.process(html)
    html = html.gsub(FENCE) do
      attrs, lang, classes = Regexp.last_match.captures
      %(<div#{attrs} class="language-#{lang}#{classes}highlighter-rouge" data-lang="#{label(lang)}")
    end
    html.gsub(TAG) do
      %(<figure class="highlight" data-lang="#{label(Regexp.last_match(1))}"><pre><code class="language-#{Regexp.last_match(1)}" data-lang="#{Regexp.last_match(2)}">)
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
  next unless doc.output_ext == ".html" && doc.output.include?("highlight")

  doc.output = CodeBlockLabels.process(doc.output)
end
