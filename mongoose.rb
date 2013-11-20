require 'formula'

class Mongoose < Formula
  homepage 'https://github.com/valenok/mongoose'
  url 'https://github.com/valenok/mongoose/archive/master.zip'

  def install
    system 'make linux_lua'
    bin.install "mongoose"
    include.install 'mongoose.h'
    prefix.install 'examples', 'UserManual.md'
  end
end