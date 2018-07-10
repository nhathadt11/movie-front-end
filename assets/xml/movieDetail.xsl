<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template match="/*[local-name()='movie']">
    <div class="images">
      <img src="{image}" />
    </div>
    <div class="movie">
      <h1 class="title"><xsl:value-of select="title/text()" /></h1>
      <h2 class="year"><xsl:value-of select="year/text()" /></h2>
      <p class="plot">
        <xsl:value-of select="plot/text()" />
      </p>
      <table class="movie-detail">
        <tbody>
          <tr><td class="label">Director:</td> <td><xsl:value-of select="director/text()" /></td></tr>
          <tr><td class="label">Genre:</td> <td><xsl:value-of select="genre/text()" /></td></tr>
          <tr><td class="label">Country:</td> <td><xsl:value-of select="country/text()" /></td></tr>
          <tr><td class="label">Duration:</td> <td><xsl:value-of select="duration" /> min</td></tr>
          <tr><td class="label">IMDB:</td> <td><xsl:value-of select="rating" /></td></tr>
          <tr><td class="label">Stars:</td> <td><xsl:value-of select="stars/text()" /></td></tr>
        </tbody>
      </table>
      <div class="buttons">
        <a href="{url}" target="_blank" class="button omg clickable">OMG It !!!</a>
      </div>
    </div>
  </xsl:template>
</xsl:stylesheet>