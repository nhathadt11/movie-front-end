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
          <tr>
            <td class="label">Director:</td>
            <td>
              <xsl:choose>
                <xsl:when test="normalize-space(director)">
                  <xsl:value-of select="director/text()" />
                </xsl:when>
                <xsl:otherwise>
                  N/A
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td class="label">Genre:</td>
            <td>
              <xsl:choose>
                <xsl:when test="normalize-space(genre)">
                  <xsl:value-of select="genre/text()" />
                </xsl:when>
                <xsl:otherwise>
                  N/A
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td class="label">Country:</td>
            <td>
              <xsl:choose>
                <xsl:when test="normalize-space(country)">
                  <xsl:value-of select="country/text()" />
                </xsl:when>
                <xsl:otherwise>
                  N/A
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td class="label">Duration:</td>
            <td>
              <xsl:choose>
                <xsl:when test="normalize-space(duration)">
                  <xsl:value-of select="duration" /> min
                </xsl:when>
                <xsl:otherwise>
                  N/A
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td class="label">IMDB:</td>
            <td>
              <xsl:choose>
                <xsl:when test="normalize-space(rating)">
                  <xsl:value-of select="format-number(rating, '#.0')" />
                </xsl:when>
                <xsl:otherwise>
                  N/A
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
          <tr>
            <td class="label">Stars:</td>
            <td>
              <xsl:choose>
                <xsl:when test="normalize-space(stars)">
                  <xsl:value-of select="stars" />
                </xsl:when>
                <xsl:otherwise>
                  N/A
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="buttons">
        <a href="{url}" target="_blank" class="button omg clickable">OMG It !!!</a>
      </div>
    </div>
  </xsl:template>
</xsl:stylesheet>