<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <xsl:for-each select="movies/movie">
      <div class="ui card float-card">
        <div class="image">
          <img src="http://via.placeholder.com/250x250" />
        </div>
        <div class="content">
          <a class="header line-clamp-2"><xsl:value-of select="title/text()"/></a>
          <div class="meta">
            <span class="date"><xsl:value-of select="year/text()"/></span>
          </div>
          <div class="description line-clamp-3">
            <xsl:value-of select="plot/text()">
          </div>
        </div>
      </div>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>