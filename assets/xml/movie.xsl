<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <xsl:for-each select="*[local-name()='movies']/*[local-name()='movie']">
      <div class="ui card float-card clickable" data-id="{id}" onclick="controller.fetchMovieDetail(this.getAttribute('data-id'))">
        <div class="image">
          <img src="{image}" />
        </div>
        <div class="content">
          <a class="header line-clamp-2"><xsl:value-of select="title/text()"/></a>
          <div class="meta">
            <span class="date"><xsl:value-of select="year/text()"/></span>
          </div>
          <div class="description line-clamp-3">
            <xsl:value-of select="plot/text()"/>
          </div>
        </div>
      </div>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>